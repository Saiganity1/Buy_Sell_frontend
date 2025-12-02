import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);

// Ensure Snack and other bundlers that expect a default export can render the app
export default App;
