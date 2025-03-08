import { useState, useEffect } from 'react'
import './App.css'
import { Layout } from './components/Layout'
import { BlockList } from './components/BlockList'
import { BlockDetails } from './components/BlockDetails'
import { TransactionDetails } from './components/TransactionDetails'
import { AddressDetails } from './components/AddressDetails'
import { BlockCounter } from './components/BlockCounter'
import { SearchBar } from './components/SearchBar'
import { NetworkInfo } from './components/NetworkInfo'
import { NetworkProvider } from './context/NetworkContext'
import { KeccakTable } from './components/KeccakTable'

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
            <BlockList />
          </>
        )
      case 'block':
        return <BlockDetails blockNumber={params.blockNumber} onBack={navigateToBlocks} />
      case 'tx':
        return <TransactionDetails txHash={params.txHash} onBack={navigateToBlocks} />
      case 'address':
        return <AddressDetails address={params.address} onBack={navigateToBlocks} />
      case 'keccak':
        return <KeccakTable />
      default:
        return (
          <>
            <SearchBar />
            <div className="grid grid-cols-2 gap-4">
              <NetworkInfo />
              <BlockCounter />
            </div>
            <BlockList />
          </>
        )
    }
  }

  return (
    <NetworkProvider>
      <Layout>
        {renderContent()}
      </Layout>
    </NetworkProvider>
  )
}

export default App
