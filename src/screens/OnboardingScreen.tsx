import { useState } from "react"
import { Platform, StyleSheet, View } from "react-native"

export const OnboardingScreen = ({navigation}:any) => {

    const [currentPage,setCurrentPage] = useState(0)

    const HiddenButton = () => {}

    const goToMain = () => navigation.replace('Main')

    return (
        <View style={{flex:1}}>

        </View>
    )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  hidden: {
    height: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  dotActive: {
    width: 25,
    backgroundColor: 'white',
  },
  page: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 72,
  },
  pageTitleBig: {
    fontSize: 56,
  },
  pageEmoji: {
    fontSize: 90,
    marginBottom: 40,
  },
  pageText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 30,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 100,
  },
  skipBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  startBtn: {
    position: 'absolute',
    bottom: 50,
    left: 30,
    right: 30,
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    zIndex: 100,
  },
  startBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});