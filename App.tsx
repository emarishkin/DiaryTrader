import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useEffect } from 'react';
import { StorageService } from './src/storage/storage';

const Stack = createNativeStackNavigator()

export default function App() {

  useEffect(()=>{
    StorageService.initDefaultStrategies()
  },[])

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name='Onboarding' component={OnboardingScreen}/>
        <Stack.Screen name='Main' component={AppNavigator} />
      </Stack.Navigator> 
    </NavigationContainer>
  );
}


