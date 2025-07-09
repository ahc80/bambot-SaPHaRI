import fs from 'fs';
import { SerialPort } from 'serialport';
import { PortHandler, PacketHandler } from './lowLevelSDK.mjs';
import { requestPort } from './webSerialShim.js';

const port = new PortHandler();
await port.requestPort(); // will call your shim
await port.openPort();    // opens /dev/ttyACM0

const ph = new PacketHandler();

global.navigator = {
  serial: {
    requestPort: async () => {
      const { requestPort } = await import('./webSerialShim.js');
      return requestPort('/dev/ttyACM0', 1000000);
    }
  }
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

import('./export_params.js').catch(err => {
  console.error("Unhandled error in export_params:", err);
});

const SCS_IDS = [1, 2, 3, 4, 5, 6];
const PARAMS = [
  { name: 'model', addr: 3, len: 2 },
  { name: 'firmware', addr: 5, len: 1 },
  { name: 'angle_limit_low', addr: 6, len: 2 },
  { name: 'angle_limit_high', addr: 8, len: 2 },
  { name: 'temp', addr: 0x2B, len: 1 },
  { name: 'position', addr: 0x38, len: 2 },
  { name: 'speed', addr: 0x3A, len: 2 },
  { name: 'load', addr: 0x3E, len: 2 },
];

async function exportParams() {
  const port = new PortHandler();

  // Patch: skip requestPort and use static serial path
  port.portPath = "/dev/ttyACM0"; // ← Change if needed
  port.setBaudRate(1000000);       // ← Match your servos

  const opened = await port.openPort();
  if (!opened) {
    console.error("Failed to open serial port.");
    return;
  }

  const ph = new PacketHandler();

  const lines = [['id', ...PARAMS.map(p => p.name)]];
  for (let id of SCS_IDS) {
    const row = [id];
    console.log(`Reading servo ID ${id}...`);

    for (let p of PARAMS) {
      let value = 0;
      let result = 0;

      try {
        if (p.len === 1) {
          [value, result] = await ph.read1ByteTxRx(port, id, p.addr);
        } else if (p.len === 2) {
          [value, result] = await ph.read2ByteTxRx(port, id, p.addr);
        } else if (p.len === 4) {
          [value, result] = await ph.read4ByteTxRx(port, id, p.addr);
        }

        if (result !== 0) {
          console.warn(`Failed to read ${p.name} from ID ${id}, result = ${result}`);
        }
      } catch (err) {
        console.error(`Exception reading ${p.name} from ID ${id}:`, err);
      }

      row.push(value);
    }

    lines.push(row);
  }

  const csv = lines.map(line => line.join(',')).join('\n');
  fs.writeFileSync('servo_params.csv', csv);
  console.log('Exported to servo_params.csv');
}

exportParams().catch(err => {
  console.error("Unhandled error:", err);
});
