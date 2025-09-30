import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappazon from './abis/Dappazon.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [dappazon, setDappazon] = useState(null)

  const [account, setAccount] = useState(null)

  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)

  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }

  const switchToLocalNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7A69',
                chainName: 'Hardhat Local',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  }

  const loadBlockchainData = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to use this application!")
        return
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)
      const network = await provider.getNetwork()

      console.log("Network Chain ID:", network.chainId.toString())
      console.log("Available configs:", Object.keys(config))
      
      const chainId = network.chainId.toString()
      const networkConfig = config[chainId]
      
      if (!networkConfig) {
        console.error(`No configuration found for network ${chainId}`)
        if (chainId === "1") {
          alert("Please switch to Hardhat Local Network (localhost:8545) to use this application. Click OK to switch automatically.")
          await switchToLocalNetwork()
          return
        }
        alert("Please connect to the Hardhat Local Network (localhost:8545)")
        return
      }

      const dappazon = new ethers.Contract(networkConfig.dappazon.address, Dappazon, provider)
      setDappazon(dappazon)

      // Verify contract is deployed
      try {
        const owner = await dappazon.owner()
        console.log("Contract owner:", owner)
      } catch (ownerError) {
        console.error("Contract not properly deployed:", ownerError)
        alert("Contract not found at the specified address. Please redeploy the contract.")
        return
      }

      const items = []

      for (var i = 0; i < 9; i++) {
        try {
          const item = await dappazon.items(i + 1)
          console.log(`Item ${i + 1}:`, item)
          items.push(item)
        } catch (itemError) {
          console.error(`Error fetching item ${i + 1}:`, itemError)
          // Skip this item and continue
          continue
        }
      }

      console.log("All items loaded:", items)

      const electronics = items.filter((item) => item.category === 'electronics')
      const clothing = items.filter((item) => item.category === 'clothing')
      const toys = items.filter((item) => item.category === 'toys')

      setElectronics(electronics)
      setClothing(clothing)
      setToys(toys)
    } catch (error) {
      console.error("Error loading blockchain data:", error)
      if (error.code === 4001) {
        alert("Please connect your MetaMask wallet to continue")
      } else if (error.code === -32002) {
        alert("MetaMask connection request is pending. Please check MetaMask.")
      } else {
        alert("Failed to connect to blockchain. Please check your connection and try again.")
      }
    }
  }

  useEffect(() => {
    loadBlockchainData()

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })

      window.ethereum.on('accountsChanged', () => {
        window.location.reload()
      })
    }

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('chainChanged')
        window.ethereum.removeAllListeners('accountsChanged')
      }
    }
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <h2>Dappazon Best Sellers</h2>

      {electronics && clothing && toys && (
        <>
          <Section title={"Clothing & Jewelry"} items={clothing} togglePop={togglePop} />
          <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop} />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
        </>
      )}

      {toggle && (
        <Product item={item} provider={provider} account={account} dappazon={dappazon} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;
