// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat")
const fs = require("fs")
const path = require("path")
const { items } = require("../src/items.json")

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [deployer] = await ethers.getSigners()

  // Deploy Dappazon
  const Dappazon = await hre.ethers.getContractFactory("Dappazon")
  const dappazon = await Dappazon.deploy()
  await dappazon.waitForDeployment()

  const contractAddress = await dappazon.getAddress()
  console.log(`Deployed Dappazon Contract at: ${contractAddress}\n`)

  // Update config.json with new contract address
  const configPath = path.join(__dirname, "../src/config.json")
  const networkId = hre.network.config.chainId || 31337
  
  let config = {}
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  }
  
  config[networkId] = {
    dappazon: {
      address: contractAddress
    }
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 4))
  console.log(`Updated config.json with contract address for network ${networkId}\n`)

  // Listing items...
  for (let i = 0; i < items.length; i++) {
    const transaction = await dappazon.connect(deployer).list(
      items[i].id,
      items[i].name,
      items[i].category,
      items[i].image,
      tokens(items[i].price),
      items[i].rating,
      items[i].stock,
    )

    await transaction.wait()

    console.log(`Listed item ${items[i].id}: ${items[i].name}`)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
