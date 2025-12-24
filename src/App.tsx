import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import { Home, Settings } from './components/views'
import TechStack from './components/views/TechStack'
import { FiHome } from 'react-icons/fi'
import { RiUserSettingsFill } from 'react-icons/ri'
import { IoDiamond } from 'react-icons/io5'
import { FaBoxOpen } from 'react-icons/fa'
import { BsStack } from 'react-icons/bs'
import RewardHub from './components/views/RewardHub'
import { BiSolidShow } from 'react-icons/bi'
import Discovery from './components/views/Discovery'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

import { useAuth } from './context/AuthContext'

function App() {
  const [activeKey, setActiveKey] = useState<string>('reward-hub')
  const { user } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Lock body scroll while mobile navbar is open
  useEffect(() => {
    const body = document.body
    if (isMobileNavOpen) {
      body.style.overflow = 'hidden'
    } else {
      body.style.overflow = ''
    }
    return () => { body.style.overflow = '' }
  }, [isMobileNavOpen])

  const links = [
    { key: 'home', label: 'Home', icon: <FiHome /> },
    { key: 'discovery', label: 'Discovery', icon: <BiSolidShow /> },
    { key: 'library', label: 'Library', icon: <FaBoxOpen /> },
    { key: 'reward-hub', label: 'Reward Hub', icon: <IoDiamond /> },
    { key: 'stack', label: 'Tech Stack', icon: <BsStack /> },
    { key: 'settings', label: 'Settings', icon: <RiUserSettingsFill /> },
  ]

  const renderView = () => {
    switch (activeKey) {
      case 'home':
        return <Home />
      case 'discovery':
        return <Discovery />
      case 'settings':
        return <Settings />
      case 'stack':
        return <TechStack />
      case 'reward-hub':
        return <RewardHub />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Tablet/Desktop sidebar */}
      <div className="hidden lg:block lg:w-[25%]">
        <Sidebar links={links} activeKey={activeKey} onSelect={setActiveKey} user={{ name: user?.name || 'User', email: user?.email || '' }} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-[200]" role="dialog" aria-modal="true">

            {/* Backdrop with subtle fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'tween', duration: 0.18, ease: 'easeOut' }}
              className="absolute inset-0 bg-black"
              onClick={() => setIsMobileNavOpen(false)}
            />
            {/* navbar with gentle slide-in */}
            <motion.div
              initial={{ x: '-100%', opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 1 }}
              transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
              className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] sm:max-w-[360px] bg-white shadow-xl"
            >
              <button type="button" aria-label="Close" onClick={() => setIsMobileNavOpen(false)} className="absolute right-3 top-3 text-slate-700">
                <FiX className="h-6 w-6" />
              </button>
              <Sidebar links={links} activeKey={activeKey} onSelect={(key) => { setActiveKey(key); setIsMobileNavOpen(false) }} user={{ name: user?.name || 'User', email: user?.email || '' }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:w-3/4 p-3 sm:p-6 bg-[#f9fafb]">
        {activeKey === 'reward-hub' ? (
          <RewardHub onOpenNav={() => setIsMobileNavOpen(true)} />
        ) : (
          renderView()
        )}
      </main>
    </div>
  )
}

export default App
