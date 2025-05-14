import localtunnel from 'localtunnel';
import { spawn } from 'child_process';
import readline from 'readline';

console.log('Starting tunnel to expose your application to the internet...');

// Create a tunnel to the local development server on port 5000
async function startTunnel() {
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
      process.exit(0);
    });

    // Close tunnel on process exit
    process.on('SIGINT', () => {
      console.log('Closing tunnel and exiting...');
      tunnel.close();
    });

    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\nPress Ctrl+C to stop the tunnel and exit.');
  } catch (error) {
    console.error('Failed to create tunnel:', error);
    process.exit(1);
  }
}

// Start the tunnel
startTunnel();