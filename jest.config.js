module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|@testing-library|@react-native-community|@react-native-picker|@react-native-async-storage|@react-native-masked-view|@react-native-segmented-control|@react-native-firebase|@react-native-google-signin|@react-native-clipboard|@react-native-community/clipboard)"
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};