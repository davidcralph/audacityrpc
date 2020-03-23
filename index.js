//* Imports
const find = require('find-process');
const winInfo = require('@arcsine/win-info');
const { Ichigo } = require('@augu/ichigo');
const fs = require('fs');

const rpc = new Ichigo('691234128808640522');
const timestamp = new Date().getTime();
 
const doStuff = async () => {
  try {
    let list = await find('name', 'audacity', true); // Find the Audacity process...
    const data = winInfo.getByPidSync(list[0].pid); // ..and get information about it

    let pluginsPath = data.owner.path.split('audacity.')[0] + '\\Plug-Ins';
    let plugins;
    if (!fs.existsSync(pluginsPath)) plugins = 0; // Detect if the user has deleted the Audacity plugins folder
    else try {
        plugins = fs.readFileSync(pluginsPath).length; // Here we get the main Audacity directory and then get the file count of the Plug-Ins directory
    } catch (e) { // Sometimes this doesn't work so we set it to 0 below
        plugins = 0; 
        console.log('Failed to get plugins count');
    }

    let title = `Working on ${data.title}`;
    if (data.title === 'Audacity') title = 'Idle'; // If the user has nothing open, we set the status as "Idle"

    rpc.setActivity({
        details: title,
        state: `Plugins: ${plugins}`,
        assets: {
            large_image: 'audacity',
            large_text: 'Audacity'
        },
        instance: false,
        timestamps: {
            start: timestamp
        }
    });
  } catch (e) {
      if (e.message.includes('pid')) console.log('Audacity isn\'t open'); 
      else console.log(e);
  }
}

doStuff(); // Run instantly on startup
setInterval(doStuff, 15000); // Then every 15 seconds

rpc.connect();