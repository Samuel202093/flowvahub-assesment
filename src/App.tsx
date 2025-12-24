import { useState } from 'react'
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

import { useAuth } from './context/AuthContext'

function App() {
  const [activeKey, setActiveKey] = useState<string>('reward-hub')
  const { user } = useAuth()

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
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <Sidebar links={links} activeKey={activeKey} onSelect={setActiveKey} user={{ name: user?.name || 'User', email: user?.email || '' }} />
      <main className="flex-1 md:w-3/4 p-6 bg-[#f9fafb]">{renderView()}</main>
    </div>
  )
}

export default App
