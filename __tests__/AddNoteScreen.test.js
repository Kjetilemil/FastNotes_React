import { NotesContext } from '@/context/NotesContext';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AddNoteScreen from '../app/(tabs)/AddNoteScreen';
import Authenticate from '../app/(tabs)/authenticate';
import ViewNoteScreen from '../app/(tabs)/ViewNoteScreen';

// Mock  expo-secure-store 
jest.mock('expo-secure-store', () => ({}));

// Mock  expo-camera
jest.mock('expo-camera', () => ({
  useCameraPermissions: () => [ { granted: true }, jest.fn() ],
}));

//mock expo-file-system
jest.mock('expo-file-system/legacy', () => ({}));

// Mock  expo-image-picker
jest.mock('expo-image-picker', () => ({
  useMediaLibraryPermissions: () => [ { granted: true }, jest.fn() ],
}));


const mockPush = jest.fn();

// Mock  expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
}));


// Mock  supabase client
jest.mock('@/lib/supabase', () => ({ supabase: {} }));

// Mock  expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useLocalSearchParams: () => ({ id: '1' }),
}));






// Test 1 - unit test - opprettelse & navigasjon
test('Unit Test - Opprettelse & Navigasjon', async () => {
  const mockAddNote = jest.fn();
  const wrapper = ({ children }) => (
    <NotesContext.Provider value={{ addNote: mockAddNote }}>
      {children}
    </NotesContext.Provider>
  );

  //test the add note functionality and navigation
  const { getByPlaceholderText, getByText } = render(
    <NavigationContainer>
      <AddNoteScreen />
    </NavigationContainer>,
    { wrapper }
  );
  fireEvent.changeText(getByPlaceholderText('Title:'), 'test title');
  fireEvent.changeText(getByPlaceholderText('Content:'), 'test content');
  fireEvent.press(getByText('Save Note'));
  expect(mockAddNote).toHaveBeenCalled();
  await waitFor(() => {
    expect(mockPush).toHaveBeenCalledWith('/');
  });
});





// Test 2 - integration test - mocking & loader
test('Integration Test - Mocking & Loader', () => {
  const mockContext = {
    notes: [],
    getNote: jest.fn(),
    addNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
  };
  const { getByText, queryByText, rerender } = render(
    <NotesContext.Provider value={mockContext}>
      <ViewNoteScreen />
    </NotesContext.Provider>
  );
  expect(getByText('Loading note...')).toBeTruthy();

  mockContext.notes = [{ id: '1', title: 'Test', content: 'Innhold', userid: 'u', updatedat: '', image_url: undefined }];
  rerender(
    <NotesContext.Provider value={mockContext}>
      <ViewNoteScreen />
    </NotesContext.Provider>
  );
  expect(queryByText('Loading note...')).toBeNull();
  expect(getByText('View Selected Note')).toBeTruthy();
});




// Test 3 - auth guard test for authenticate
test('Auth Guard Test - Tilgangskontroll', () => {
  const { getByText } = render(<Authenticate />);
  expect(getByText('Log in or sign up to continue')).toBeTruthy();
  expect(getByText('Log In')).toBeTruthy();
  expect(getByText('Sign Up')).toBeTruthy();
});






