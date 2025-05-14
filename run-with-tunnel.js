import localtunnel from 'localtunnel';
import { spawn } from 'child_process';

// First start the application
console.log('Starting the application...');
const appProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

appProcess.on('error', (error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});

// Wait a bit to ensure the app has started before creating the tunnel
setTimeout(async () => {
  console.log('Starting tunnel to expose your application...');
  
  try {
    const tunnel = await localtunnel({ port: 5000 });
    
    console.log(`
=====================================================
🎉 SUCCESS! Your app is now available at:

📱 ${tunnel.url}

Open this URL on your mobile device to access the app.
=====================================================
`);

    // Handle tunnel errors
    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });

    // Handle tunnel close
    tunnel.on('close', () => {
      console.log('Tunnel closed');
      appProcess.kill();
      process.exit(0);
    });

    // Close tunnel and app on process exit
    process.on('SIGINT', () => {
      console.log('Closing tunnel and application...');
      tunnel.close();
      appProcess.kill();
    });

    console.log('\nPress Ctrl+C to stop everything and exit.');
  } catch (error) {
    console.error('Failed to create tunnel:', error);
    appProcess.kill();
    process.exit(1);
  }
}, 5000); // Wait 5 seconds for the app to start