# SimpleDEX

Este proyecto implementa un **intercambio descentralizado (DEX)** simple usando contratos inteligentes, interactuando con ellos a través de una interfaz web que se conecta a **MetaMask** y **Scroll Sepolia**. Los usuarios pueden interactuar con los contratos de tokens ERC-20 (TokenA y TokenB) y un contrato de intercambio SimpleDEX, permitiendo agregar y retirar liquidez, y realizar intercambios de tokens.

## Tecnologías

- **Backend**: Node.js con **Express.js** para servir la aplicación web.
- **Frontend**: HTML, CSS, JavaScript (usando la librería **Ethers.js** para interactuar con contratos inteligentes).
- **Blockchain**: Contratos inteligentes desplegados en la red **Scroll Sepolia**.
- **MetaMask**: Para gestionar la conexión de la wallet de los usuarios.

## Funcionalidades

- **Conectar la wallet**: Los usuarios pueden conectar su wallet de **MetaMask** para interactuar con los contratos.
- **Obtener precios**: Los usuarios pueden obtener el precio actual de los tokens **TokenA** y **TokenB** a través del contrato SimpleDEX.
- **Agregar liquidez**: Permite a los propietarios del contrato agregar liquidez de **TokenA** y **TokenB** al DEX.
- **Retirar liquidez**: Los propietarios del contrato pueden retirar liquidez de **TokenA** y **TokenB** del DEX.
- **Intercambiar tokens**: Los usuarios pueden intercambiar **TokenA** por **TokenB** y viceversa.

## Requisitos previos

- **MetaMask**: Asegúrate de tener **MetaMask** instalado en tu navegador.
- **Red de Scroll Sepolia**: Conéctate a la red **Scroll Sepolia** en MetaMask.
- **Node.js**: Asegúrate de tener **Node.js** instalado en tu máquina local.

## Instalación

Para instalar y ejecutar este proyecto en tu máquina local, sigue estos pasos:

1. **Clona el repositorio**

   Abre tu terminal y ejecuta el siguiente comando para clonar el repositorio:

   ```bash
   git clone https://github.com/tu_usuario/simpledex.git
2. **Instala las dependencias**

    Accede a la carpeta del proyecto:
   -  cd simpledex
      Luego instala las dependencias necesarias para ejecutar el servidor y las interacciones con los contratos inteligentes:
   -  npm install
3. **Ejecuta el servidor**

    Una vez que las dependencias estén instaladas, puedes iniciar el servidor con el siguiente comando:
   - node server.js


