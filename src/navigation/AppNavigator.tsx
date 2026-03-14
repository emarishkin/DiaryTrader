import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet, Text, View } from "react-native";

import DashboardScreen from '../screens/DashboardScreen'
import AddTradeScreen  from "../screens/AddTradeScreen";
import StatisticsScreen from "../screens/StatisticsScreen";

const Tab = createBottomTabNavigator()

const icons = {
  dashboard: require('../../assets/HouseDashboardScreenLogo.png'),
  add: require('../../assets/PlusLogoAddTrades.png'),
  statistics: require('../../assets/statisticsLogo.png'),
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
                component={DashboardScreen}
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
                component={StatisticsScreen}
                options={{
                    tabBarIcon:({focused}) => (
                        <TabIcon source={icons.statistics} focused={focused} />
                    )
                }}
            />

        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    height: 70,
    borderRadius: 32,
    marginHorizontal: 26,
    marginBottom: 26,
    position: 'absolute',
    paddingBottom: 0,  
    paddingTop: 16 ,
  },

  // Обычная иконка
  iconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  iconWrapperActive: {
    backgroundColor: '#E3F2FD',
    transform: [{ scale: 1.05 }],
  },
  icon: {
    width: 30,
    height: 30,
  },
  iconInactive: {
    tintColor: '#9E9E9E',
    opacity: 0.6,
  },
  iconActive: {
    tintColor: '#1E88E5',
  },

  // Кнопка добавить
  addWrapper: {
    width: 44,
    height: 44,
    borderRadius: 26,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  addWrapperActive: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
    transform: [{ scale: 1.05 }],
  },
  addIcon: {
    width: 24,
    height: 24,
    tintColor: '#9E9E9E',
  },
  addIconActive: {
    tintColor: '#FFFFFF',
  },
});