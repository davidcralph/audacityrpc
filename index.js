const find = require('find-process');
const winInfo = require('@arcsine/win-info');
const { Ichigo } = require('@augu/ichigo');
const fs = require('fs');
const { getFileProperties } = require('get-file-properties');

const rpc = new Ichigo('691234128808640522');
const timestamp = new Date().getTime();
 
const setRPC = async () => {
  try {
    const list = await find('name', 'audacity', true);
    const data = winInfo.getByPidSync(list[0].pid);

    const folder = data.owner.path.split('audacity.')[0];

    let pluginsPath = folder + '\\Plug-Ins';
    let plugins;

    if (!fs.existsSync(pluginsPath)) {
        plugins = 0; // Detect if the user has deleted the Audacity plugins folder
    } else {
        try {
            plugins = fs.readFileSync(pluginsPath).length;
        } catch (e) { // Sometimes this doesn't work so we set it to 0 below
            plugins = 0; 
            console.log('Failed to get plugins count');
        }
    }

    let title = `Working on ${data.title}`;
    if (data.title === 'Audacity') {
        title = 'Working on a project'; // If the user has nothing open, we assume they are working on something. todo: check if focused
    }

    const { Version } = await getFileProperties(folder + '\\audacity.exe'); // todo: check to see if this errors on non-windows and catch if it does

    rpc.setActivity({
        details: title,
        state: `Plugins: ${plugins}`,
        assets: {
            large_image: 'audacity',
            large_text: 'Audacity ' + Version
        },
        instance: false,
        timestamps: {
            start: timestamp
        }
    });
  } catch (e) {
    if (e.message.includes('pid')) {
        console.log('Audacity isn\'t open'); 
    } else {
        console.log(e);
    }
  }
}

setRPC().then(() => {
    setInterval(setRPC, 15000);
});

rpc.connect();