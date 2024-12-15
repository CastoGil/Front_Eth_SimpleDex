const { ethers } = window;

// Direcciones de los contratos
const tokenAAddress = "0xb05D7F8086090FeB8d9F17e1Ba51c3e392f8464F";
const tokenBAddress = "0x72823F674c8cd3933585eFA7902C3d5fA5B9e2b7";
const dexAddress = "0xd5A87Ea9F126A783E5bea8DF2770d327DE515875";
const EXPECTED_CHAIN_ID = 534351; // Scroll Sepolia

// Variables globales
let provider, signer, walletAddress;
let tokenAContract, tokenBContract, dexContract;

// Función para conectar la wallet
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Por favor, instala MetaMask para continuar.");
    throw new Error("MetaMask no detectado.");
  }
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();

    if (network.chainId !== EXPECTED_CHAIN_ID) {
      alert(`Por favor, cambia a la red Scroll Sepolia en MetaMask.`);
      throw new Error("Red incorrecta.");
    }
    console.log(`Conectado a la red: Scroll Sepolia (${network.chainId})`);

    signer = provider.getSigner();

    walletAddress = await signer.getAddress();

    document.getElementById(
      "wallet-address"
    ).textContent = `Wallet: ${walletAddress}`;

    updateBalance();
    updateTokenPrice();
  } catch (error) {
    showError("Error al conectar la wallet.", error);
  }
}

// Función para cargar los ABIs y configurar contratos
async function loadAbis() {
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    const [tokenAAbi, tokenBAbi, dexAbi] = await Promise.all([
      fetch("./abi/TokenA.json").then((res) => res.json()),
      fetch("./abi/TokenB.json").then((res) => res.json()),
      fetch("./abi/SimpleDEX.json").then((res) => res.json()),
    ]);

    tokenAContract = new ethers.Contract(tokenAAddress, tokenAAbi, signer);
    tokenBContract = new ethers.Contract(tokenBAddress, tokenBAbi, signer);
    dexContract = new ethers.Contract(dexAddress, dexAbi, signer);
    console.log("Contratos cargados correctamente.");
  } catch (error) {
    showError("Error al cargar los contratos.", error);
  }
}
// Mostrar el precio actual de los tokens en función del intercambio
async function updateTokenPrice() {
  try {
    // Obtener los precios de los tokens
    const [priceAtoB, priceBtoA] = await Promise.all([
      dexContract.getPrice(tokenAAddress), 
      dexContract.getPrice(tokenBAddress),
    ]);

    // Formatear los valores para mostrar de forma legible
    const priceAtoBFormatted = ethers.utils.formatUnits(priceAtoB, 18);
    const priceBtoAFormatted = ethers.utils.formatUnits(priceBtoA, 18);

    // Mostrar los precios en el DOM
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = `
      <p>1 TokenA = ${priceAtoBFormatted} TokenB</p>
      <p>1 TokenB = ${priceBtoAFormatted} TokenA</p>
    `;
  } catch (error) {
    showError("No se pudo obtener el precio de los tokens.", error);
    alert("No se pudo obtener el precio de los tokens.");
  }
}

// Función para actualizar el balance de ETH
async function updateBalance() {
  try {
    const balance = await provider.getBalance(walletAddress);
    document.getElementById(
      "balance"
    ).textContent = `Balance ETH: ${ethers.utils.formatEther(balance)}`;
  } catch (error) {
    showError("Error al obtener el balance.", error);
  }
}

// Función general para obtener el precio de un token
async function getTokenPrice(tokenAddress, displayId) {
  try {
    const price = await dexContract.getPrice(tokenAddress);
    document.getElementById(
      displayId
    ).textContent = `Precio: ${ethers.utils.formatEther(price)} ${
      tokenAddress === tokenAAddress ? "TokenB" : "TokenA"
    }`;
  } catch (error) {
    showError(`Error al obtener el precio de ${tokenAddress}:`, error);
  }
}

// Función para agregar liquidez
async function addLiquidity() {
  try {
    const owner = await dexContract.owner();
    if (owner.toLowerCase() !== walletAddress.toLowerCase()) {
      alert("Solo el propietario del contrato puede añadir liquidez.");
      return;
    }

    const [inputA, inputB] = [
      document.getElementById("liquidity-a").value,
      document.getElementById("liquidity-b").value,
    ];

    if (!inputA || !inputB || isNaN(inputA) || isNaN(inputB)) {
      alert("Por favor, ingresa valores válidos para ambos tokens.");
      return;
    }

    const amountA = ethers.utils.parseEther(inputA);
    const amountB = ethers.utils.parseEther(inputB);

    const [balanceA, balanceB] = await Promise.all([
      tokenAContract.balanceOf(walletAddress),
      tokenBContract.balanceOf(walletAddress),
    ]);

    if (balanceA.lt(amountA) || balanceB.lt(amountB)) {
      alert("No tienes suficientes tokens para añadir liquidez.");
      return;
    }

    const [allowanceA, allowanceB] = await Promise.all([
      tokenAContract.allowance(walletAddress, dexAddress),
      tokenBContract.allowance(walletAddress, dexAddress),
    ]);

    if (allowanceA.lt(amountA)) {
      await tokenAContract.approve(dexAddress, amountA);
    }

    if (allowanceB.lt(amountB)) {
      await tokenBContract.approve(dexAddress, amountB);
    }

    const tx = await dexContract.addLiquidity(amountA, amountB);

    console.log(`Transacción enviada: ${tx.hash}`);
    await tx.wait();
    alert("Liquidez agregada exitosamente.");
  } catch (error) {
    showError("Error al agregar liquidez:", error);
    alert(`Error: ${error.message || "Desconocido"}`);
  }
}

// Función para retirar liquidez
async function removeLiquidity() {
  try {
    const amountA = ethers.utils.parseEther(
      document.getElementById("remove-a").value
    );
    const amountB = ethers.utils.parseEther(
      document.getElementById("remove-b").value
    );
    const tx = await dexContract.removeLiquidity(amountA, amountB);
    console.log(`Transacción enviada: ${tx.hash}`);
    await tx.wait();
    alert("Liquidez retirada exitosamente.");
  } catch (error) {
    showError("Error al retirar liquidez:", error);
  }
}

// Función para realizar intercambio TokenA por TokenB
async function swapTokens(fromToken, toToken, amountIn, swapFunction) {
  try {
    const amountInWei = ethers.utils.parseEther(amountIn);
    const tx = await dexContract[swapFunction](amountInWei);
    await tx.wait();
    alert(`Intercambio de ${fromToken} por ${toToken} completado.`);
    updateTokenPrice(); // Actualizar precios después del intercambio
  } catch (error) {
    showError(`Error al intercambiar ${fromToken} por ${toToken}:`, error);
  }
}

// Event Listeners
document.getElementById("connect-wallet").onclick = connectWallet;
document.getElementById("get-price-token-a").onclick = () =>
  getTokenPrice(tokenAAddress, "price-token-a");
document.getElementById("get-price-token-b").onclick = () =>
  getTokenPrice(tokenBAddress, "price-token-b");
document.getElementById("add-liquidity").onclick = addLiquidity;
document.getElementById("remove-liquidity").onclick = removeLiquidity;
document.getElementById("swap-a-to-b").onclick = () =>
  swapTokens(
    "TokenA",
    "TokenB",
    document.getElementById("amount-a").value,
    "swapAforB"
  );
document.getElementById("swap-b-to-a").onclick = () =>
  swapTokens(
    "TokenB",
    "TokenA",
    document.getElementById("amount-b").value,
    "swapBforA"
  );

function showError(message, error = null) {
  console.error(message, error);
  const errorMessage =
    error?.data?.message || error?.message || "Error desconocido";
  alert(`${message}\nDetalle: ${errorMessage}`);
}

// Cargar ABIs al inicio
window.onload = async function () {
  await loadAbis();
};
