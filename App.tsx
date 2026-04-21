import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useEffect, useState } from 'react';
import { StorageService } from './src/storage/storage';
import { API } from './src/storage/api';
import { AuthScreen } from './src/screens/AuthScreen';

const Stack = createNativeStackNavigator()

export default function App() {

  const [isLoggedIn,setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(()=>{
    checkAuth()
    StorageService.initDefaultStrategies()
  },[])

  const checkAuth = async () => {
    const loggedIn = await API.isLoggedIn()
    setIsLoggedIn(loggedIn)
  }

  if(isLoggedIn === null) return null

  if(!isLoggedIn){
    return <AuthScreen onAuth={()=> setIsLoggedIn(true)} />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name='Onboarding' component={OnboardingScreen}/>
        <Stack.Screen name='Main' component={AppNavigator} />
      </Stack.Navigator> 
    </NavigationContainer>
  );
}


