import React, { ReactNode, useState } from 'react'
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  DrawerContent,
  useDisclosure,
  BoxProps,
  FlexProps,
  Link,
} from '@chakra-ui/react'

import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
} from 'react-icons/fi'

import { 
  IoIdCardOutline 

} from "react-icons/io5";
import { FaMagnifyingGlassArrowRight } from "react-icons/fa6";
import { FaSimCard } from "react-icons/fa";

import { IconType } from 'react-icons'
import { ReactText } from 'react'
import { FastReading } from './Pages/FastReading';
import { FullReading } from './Pages/FullReading';
import { ISO7816 } from './Pages/ISO7816';
import { Settings } from './Pages/Settings/Settings';
import { Route, Routes, useNavigate } from 'react-router-dom';

interface LinkItemProps {
  name: string
  icon: IconType,
  onClick: (idx:number)=>void,
  page : (()=>JSX.Element)
}




// const Pages: (()=>JSX.Element)[] = [
//   FastReading,
//   FullReading,
//   ISO7816,
//   Settings
// ]

export default function Sidebar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [curPage, setCurPage] = useState(0);
  const navigate = useNavigate();

  const LinkItems: Array<LinkItemProps> = [
    { 
      name: 'Fast Reading', 
      icon: FaMagnifyingGlassArrowRight,
      onClick : (idx)=> {
        // setCurPage(idx);
        navigate("/FastReading")
      },
      page : FastReading
    },
    { 
      name: 'Full Reading', 
      icon: IoIdCardOutline, 
      onClick:(idx)=>{
        // setCurPage(idx);
        navigate("/FullReading")
      },
      page : FullReading
    },
    { 
      name: 'ISO7816', 
      icon: FaSimCard, 
      onClick:(idx)=>{
        // setCurPage(idx);
        navigate("/ISO7816")
      },
      page : ISO7816
    },
    { 
      name: 'Settings', icon: FiSettings,
      onClick:(idx)=>{
        // setCurPage(idx);
        navigate("/Settings")
      },
      page : Settings
    },
  ]
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent onClose={() => onClose} LinkItems={LinkItems} display={{ base: 'none', md: 'block' }} />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full">
        <DrawerContent>
          <SidebarContent onClose={onClose} LinkItems={LinkItems} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {/* Content */}
        
        
        <Routes>
          <Route path='/' element={<FastReading/>}/>
          <Route path='/FastReading' element={<FastReading/>}/>
          <Route path='/FullReading' element={<FullReading/>}/>
          <Route path='/ISO7816' element={<ISO7816/>}/>
          <Route path='/Settings' element={<Settings/>}/>
        </Routes>
      </Box>
    </Box>
  )
}

interface SidebarProps extends BoxProps {
  onClose: () => void
  LinkItems: LinkItemProps[]
}

const SidebarContent = ({ onClose,LinkItems, ...rest }: SidebarProps) => {
  const navitator = useNavigate()
  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}>
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        {/* <IoIdCardOutline /> */}
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          CARD Tools
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link,idx) => (
        <NavItem 
          key={link.name} 
          icon={link.icon} 
          onClick={
            ()=>{
              link.onClick(idx);
              onClose();
            }
          }
        >
          {link.name}
        </NavItem>
      ))}
    </Box>
  )
}

interface NavItemProps extends FlexProps {
  icon: IconType
  children: ReactText
}
const NavItem = ({ icon, children, ...rest }: NavItemProps) => {
  return (
    <Box
      as="a"
      href="#"
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: 'cyan.400',
          color: 'white',
        }}
        {...rest}>
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Box>
  )
}

interface MobileProps extends FlexProps {
  onOpen: () => void
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent="flex-start"
      {...rest}>
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
        Logo
      </Text>
    </Flex>
  )
}