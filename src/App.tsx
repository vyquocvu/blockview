import { useState, useEffect } from 'react'
import './App.css'
import { Layout } from './components/Layout'
import { BlockList } from './components/BlockList'
import { BlockDetails } from './components/BlockDetails'
import { TransactionDetails } from './components/TransactionDetails'
import { AddressDetails } from './components/AddressDetails'
import { Profile } from './components/Profile'
import { BlockCounter } from './components/BlockCounter'
import { SearchBar } from './components/SearchBar'
import { NetworkInfo } from './components/NetworkInfo'
import { GasTracker } from './components/GasTracker'
import { RpcInterface } from './components/RpcInterface'
import { EventLogFilter } from './components/EventLogFilter'
import { NetworkProvider } from './context/NetworkContext'
import { WalletProvider } from './context/WalletContext'
import { KeccakTable } from './components/KeccakTable'
import { UnitHelper } from './components/UnitHelper'
import { TransactionsPage } from './components/TransactionsPage'
import { AccountsPage } from './components/AccountsPage'
import { TokensPage } from './components/TokensPage'
import { TokenDetails } from './components/TokenDetails'
import { Web3UtilityDemo } from './components/Web3UtilityDemo'

function App() {
  const [route, setRoute] = useState<string>('blocks')
  const [params, setParams] = useState<Record<string, string>>({})

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || '/blocks'
      const [path, paramString] = hash.split('?')
      
      // Parse route path
      const routePath = path.startsWith('/') ? path.substring(1) : path
      const [routeName, ...routeParams] = routePath.split('/')
      
      // Set the current route
      setRoute(routeName || 'blocks')
      
      // Parse route parameters
      const newParams: Record<string, string> = {}
      
      // Handle path parameters like /block/123
      if (routeName === 'block' && routeParams[0]) {
        newParams.blockNumber = routeParams[0]
      } else if (routeName === 'tx' && routeParams[0]) {
        newParams.txHash = routeParams[0]
      } else if (routeName === 'address' && routeParams[0]) {
        newParams.address = routeParams[0]
      } else if (routeName === 'profile' && routeParams[0]) {
        newParams.address = routeParams[0]
      } else if (routeName === 'token' && routeParams[0]) {
        newParams.address = routeParams[0]
      }
      
      // Handle query parameters
      if (paramString) {
        const searchParams = new URLSearchParams(paramString)
        searchParams.forEach((value, key) => {
          newParams[key] = value
        })
      }
      
      setParams(newParams)
    }

    // Initialize route
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Navigate back to blocks list
  const navigateToBlocks = () => {
    window.location.hash = '/blocks'
  }

  const navigateToTokens = () => {
    window.location.hash = '/tokens'
  }

  // Render the appropriate component based on the current route
  const renderContent = () => {
    switch (route) {
      case 'blocks':
        return (
          <>
            <SearchBar />
            <div className="grid grid-cols-2 gap-4">
              <NetworkInfo />
              <BlockCounter />
            </div>
            <GasTracker />
            <BlockList />
          </>
        )
      case 'block':
        return <BlockDetails blockNumber={params.blockNumber} onBack={navigateToBlocks} />
      case 'tx':
        return <TransactionDetails txHash={params.txHash} onBack={navigateToBlocks} />
      case 'address':
        return <AddressDetails address={params.address} onBack={navigateToBlocks} />
      case 'profile':
        return <Profile address={params.address} onBack={navigateToBlocks} />
      case 'transactions':
        return <TransactionsPage />
      case 'accounts':
        return <AccountsPage />
      case 'tokens':
        return <TokensPage />
      case 'token':
        return <TokenDetails address={params.address} onBack={navigateToTokens} />
      case 'keccak':
        return <KeccakTable />
      case 'helper':
        return <UnitHelper />
      case 'rpc':
        return <RpcInterface />
      case 'logs':
        return <EventLogFilter />
      case 'web3-demo':
        return <Web3UtilityDemo />
      default:
        return (
          <>
            <SearchBar />
            <div className="grid grid-cols-2 gap-4">
              <NetworkInfo />
              <BlockCounter />
            </div>
            <GasTracker />
            <BlockList />
          </>
        )
    }
  }

  return (
    <NetworkProvider>
      <WalletProvider>
        <Layout>
          {renderContent()}
        </Layout>
      </WalletProvider>
    </NetworkProvider>
  )
}

export default App
