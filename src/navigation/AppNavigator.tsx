import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet, Text, View } from "react-native";

import DashboardScreen from '../screens/DashboardScreen'
import AddTradeScreen  from "../screens/AddTradeScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TradeHistoryScreen from "../screens/TradeHistoryScreen";
import { StrategiesScreen  } from "../screens/StrategiesScreen";
import { TradeDetailScreen } from "../screens/TradeDetailScreen";
import { StrategyDetailScreen } from "../screens/StrategyDetailScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { BalanceScreen } from "../screens/BalanceScreen";

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

const icons = {
  dashboard: require('../../assets/HouseDashboardScreenLogo.png'),
  add: require('../../assets/PlusLogoAddTrades.png'),
  statistics: require('../../assets/statisticsLogo.png'),
  setting: require('../../assets/settingsLogo.png')
};

function TabIcon({source,focused,isAdd}:{source:any,focused:boolean,isAdd?:boolean}){
    if(isAdd){
        return(
            <View style={[styles.addWrapper,focused && styles.addWrapperActive]}>
                <Image
                    source={source}
                    style={[styles.addIcon, focused && styles.addIconActive]}
                    resizeMode='contain'
                />
            </View>
        )
    }
    return (
        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <Image 
                source={source}
                style={[styles.icon, focused ? styles.iconActive : styles.iconInactive]}
                resizeMode="contain"
            />
        </View>
    )
}

const DashboardStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="DashboardHome" component={DashboardScreen} />
            <Stack.Screen name="TradeHistory" component={TradeHistoryScreen} />
            <Stack.Screen name="TradeDetail" component={TradeDetailScreen} />
            <Stack.Screen name="EditTrade" component={AddTradeScreen} />
            <Stack.Screen name="Strategies" component={StrategiesScreen} />
            <Stack.Screen name="StrategyDetail" component={StrategyDetailScreen} />
            <Stack.Screen name="Balance" component={BalanceScreen} />
        </Stack.Navigator>
    )
}

const StatisticsStack = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="StatisticsHome" component={StatisticsScreen} />
        </Stack.Navigator>
    )
}

export const AppNavigator = () => {
    return(
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardStack}
                options={{
                    tabBarIcon:({focused}) => (
                        <TabIcon source={icons.dashboard} focused={focused} />  
                    )
                }}
            />
            
            <Tab.Screen 
                name="AddTrade"
                component={AddTradeScreen}
                options={{
                    tabBarIcon:({focused}) => <TabIcon source={icons.add} isAdd focused={focused} />
                }}
            />

            <Tab.Screen 
                name="Statistics"
                component={StatisticsStack}
                options={{
                    tabBarIcon:({focused}) => (
                        <TabIcon source={icons.statistics} focused={focused} />
                    )
                }}
            />

            <Tab.Screen 
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon:({focused}) => (
                        <TabIcon source={icons.setting} focused={focused} />
                    )
                }}
            />

        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1A1A24',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    height: 70,
    borderRadius: 32,
    marginHorizontal: 26,
    marginBottom: 26,
    position: 'absolute',
    paddingBottom: 0,
    paddingTop: 16,
    borderWidth: 1.5,
    borderColor: '#2A2A38',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  iconWrapperActive: {
    backgroundColor: '#1A2A4A',
    transform: [{ scale: 1.05 }],
  },
  icon: {
    width: 30,
    height: 30,
  },
  iconInactive: {
    tintColor: '#555577',
    opacity: 0.8,
  },
  iconActive: {
    tintColor: '#2979FF',
  },
  addWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#13131C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2A2A38',
  },
  addWrapperActive: {
    backgroundColor: '#2979FF',
    borderColor: '#2979FF',
    transform: [{ scale: 1.05 }],
  },
  addIcon: {
    width: 24,
    height: 24,
    tintColor: '#555577',
  },
  addIconActive: {
    tintColor: '#FFFFFF',
  },
});