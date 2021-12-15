import { MethodArgs } from '../args';
import { promises, Stats } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import * as AdmZip from 'adm-zip';

const readFile = promises.readFile;
const readDir = promises.readdir;
const stat = promises.stat;
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 - 1;

type Signature = {
  hash: string,
  path: string
}
type Path = string
type FileContent = Buffer;

interface FileHandler {
  (filePath: string, stats: Stats): void;
}

const memtable: string[] = [
  "fBTyHDn2nUU0jgEu5XBJ5A",
  "xmC9OBzdfLaIBvKVSKbc7g",
  "NUt//j2o6sDxLqSTFfyPmQ",
  "xmC9OBzdfLaIBvKVSKbc7g",
  "oTC+5gi+FbG1R4jpKTfbTg",
  "xmC9OBzdfLaIBvKVSKbc7g",
  "uOUpCKY40NVjHQc2a9Xr8A",
  "xmC9OBzdfLaIBvKVSKbc7g",
  "4Vvmz4X2WmipllB5/ous7Q",
  "vWVkVsfR4RQjHvDG6pfOUg",
  "4DIQPHWEb/z7bholX3/oTg",
  "xmC9OBzdfLaIBvKVSKbc7g",
  "H7sEuRs4sj0D45EAltPQ1w",
  "BP3XAYCdF0ZcF8fmA7GyAg",
  "U//86tIjlVCgQQZXTQudVA",
  "gw4e9TvocE+JqXdQ/8sxZg",
  "BP3XAYCdF0ZcF8fmA7GyAg",
  "U//86tIjlVCgQQZXTQudVA",
  "gw4e9TvocE+JqXdQ/8sxZg",
  "BP3XAYCdF0ZcF8fmA7GyAg",
  "U//86tIjlVCgQQZXTQudVA",
  "gw4e9TvocE+JqXdQ/8sxZg",
  "BP3XAYCdF0ZcF8fmA7GyAg",
  "U//86tIjlVCgQQZXTQudVA",
  "krWKtKP0VH0HJkOaXl8tqw",
  "WCRxHWxoFi61NcxNv3SF0w",
  "yMKfrOVkLDiRsU9R9XbOKw",
  "krWKtKP0VH0HJkOaXl8tqw",
  "WCRxHWxoFi61NcxNv3SF0w",
  "yMKfrOVkLDiRsU9R9XbOKw",
  "378Ytn/c/2G236FMYcwXgQ",
  "IfBVtiwVRT8NeXCp2ZTKtw",
  "8e87HEC9TS3elmUxSejDMQ",
  "y6QMMJo6qLeAwNYvTLrPdw",
  "IfBVtiwVRT8NeXCp2ZTKtw",
  "8e87HEC9TS3elmUxSejDMQ",
  "y6QMMJo6qLeAwNYvTLrPdw",
  "IfBVtiwVRT8NeXCp2ZTKtw",
  "8e87HEC9TS3elmUxSejDMQ",
  "y6QMMJo6qLeAwNYvTLrPdw",
  "IfBVtiwVRT8NeXCp2ZTKtw",
  "8e87HEC9TS3elmUxSejDMQ",
  "lJ9a5c4V2OLQiuoPftBxkg",
  "8dYwxIkoCWpITkuVzLFioA",
  "bnTGE5aRFbMPtWoJ7dB2rw",
  "apRhBWBUAlHxAZqSOZMx+g",
  "8dYwxIkoCWpITkuVzLFioA",
  "bnTGE5aRFbMPtWoJ7dB2rw",
  "EVldHOg3IcMdjSjEWkRajA",
  "axX0LDM6w5q6z+7rGIUqRA",
  "xmC9OBzdfLaIBvKVSKbc7g",
  "EVldHOg3IcMdjSjEWkRajA",
  "axX0LDM6w5q6z+7rGIUqRA",
  "xmC9OBzdfLaIBvKVSKbc7g",
  "EVldHOg3IcMdjSjEWkRajA",
  "axX0LDM6w5q6z+7rGIUqRA",
  "xmC9OBzdfLaIBvKVSKbc7g",
  "pqMfiTE8K6QL1Ap2zCptrg",
  "iyJgsczmQUT2MQh2+UsWOA",
  "TRIdDjt+4nGJdKn689895A",
  "pqMfiTE8K6QL1Ap2zCptrg",
  "iyJgsczmQUT2MQh2+UsWOA",
  "TRIdDjt+4nGJdKn689895A",
  "pqMfiTE8K6QL1Ap2zCptrg",
  "iyJgsczmQUT2MQh2+UsWOA",
  "TRIdDjt+4nGJdKn689895A",
  "CfmJLv6mhLVOjRvflS+vZA",
  "O9n0G4nOT+jMv3PkMZWlzg",
  "G1tHtzggRx3R9OPli2N0Tg",
  "CfmJLv6mhLVOjRvflS+vZA",
  "O9n0G4nOT+jMv3PkMZWlzg",
  "G1tHtzggRx3R9OPli2N0Tg",
  "CfmJLv6mhLVOjRvflS+vZA",
  "O9n0G4nOT+jMv3PkMZWlzg",
  "G1tHtzggRx3R9OPli2N0Tg",
  "t87654Z07FBVp4PlKbBJuw",
  "QVwT58hQX7BW1UDqwpty+g",
  "44Xe+Vv3qrNNcyy3/tgHUw",
  "HzzHitFLamLd6qGdA4XliA",
  "QVwT58hQX7BW1UDqwpty+g",
  "PHOrfl3/GKl2tZspVXbzVQ",
  "Vok11jPt8NBpgaOhKOBmcA",
  "oZNwOQSj8Y+zyQqHfrXIpw",
  "cgy4bLqsMMH9qQTGVealZg",
  "HzzHitFLamLd6qGdA4XliA",
  "QVwT58hQX7BW1UDqwpty+g",
  "PHOrfl3/GKl2tZspVXbzVQ",
  "HzzHitFLamLd6qGdA4XliA",
  "BP3XAYCdF0ZcF8fmA7GyAg",
  "PHOrfl3/GKl2tZspVXbzVQ",
  "HzzHitFLamLd6qGdA4XliA",
  "BP3XAYCdF0ZcF8fmA7GyAg",
  "PHOrfl3/GKl2tZspVXbzVQ",
  "jAzz6wRxVKT44W2vWiCTGQ",
  "+/pfM6tLKab91SRz7nuDTQ",
  "FS7LPOCUrFvJ6jnWEi4oFA",
  "zXChiI7N0xHBmQ54SGfOHg",
  "CI3xE60kmrcr8Zt/ALhj1Q",
  "3o0BzBX9DHT+qLu2aOKJ9Q",
  "3JkBHwR+Y9zHQbWraNEW2w",
  "Kr7CzmZeDVKaPyj/+7st0w",
  "siQt4Gd75lFdbO+/SOfl1Q",
  "yL2LXFqqoHo9y/V94BySZg",
  "XFJ4IdEISn7z4D1AFE/1Mg",
  "02XkgiFBT5P+7wk6G/YH7w",
  "txoT/V3yUWlPyhFiQAA7Ig",
  "ATi6HBkdXHVP0OPDphwDBw",
  "CsWz5uabp3ZWg3mOZpowsg",
  "jTMVRLLnsgrRZt68olUNcw",
  "zH1V7WnMX9NANbFcbt95oA",
  "XkvKXtILlKsZu2WDbak/lg",
  "lI3aeHWTNAp68aGOMot7fw",
  "hiwAsuhU+cDx6NhAnSPYmQ",
  "EQqz4+TzeAkh6O5d3jNzrQ",
  "8MQ62soq/HHGzID4UbOIGA",
  "3Q4+C0BAg+xpYYqrtQuKwA",
  "AHnJByMGWZaPD8DkGmq8+Q",
  "SPfzzaUwMKh+jDh9jR5CZQ",
  "RyyOH7qg5hUg4CXCVbXRaA",
  "VSPxRPrvK/ygijyosr7Nag",
  "K2Pg5QY/2sz2aaHiY4Tz/Q",
  "VHuz7S3rhW0OO713wnuWJQ",
  "SlF3oXJ2S9pvRHK5S6F8yw",
  "xtIzvI6c/l2mkAWdJ9n4jw",
  "+rZGJX+UWwsqfOPhw+POXw",
  "lC9Cnqy4AV4Y2PWZls++5g",
  "jAzz6wRxVKT44W2vWiCTGQ",
  "+/pfM6tLKab91SRz7nuDTQ",
  "FS7LPOCUrFvJ6jnWEi4oFA",
  "zXChiI7N0xHBmQ54SGfOHg",
  "CI3xE60kmrcr8Zt/ALhj1Q",
  "3o0BzBX9DHT+qLu2aOKJ9Q",
  "3JkBHwR+Y9zHQbWraNEW2w",
  "Kr7CzmZeDVKaPyj/+7st0w",
  "siQt4Gd75lFdbO+/SOfl1Q",
  "yL2LXFqqoHo9y/V94BySZg",
  "XFJ4IdEISn7z4D1AFE/1Mg",
  "02XkgiFBT5P+7wk6G/YH7w",
  "txoT/V3yUWlPyhFiQAA7Ig",
  "ATi6HBkdXHVP0OPDphwDBw",
  "CsWz5uabp3ZWg3mOZpowsg",
  "jTMVRLLnsgrRZt68olUNcw",
  "zH1V7WnMX9NANbFcbt95oA",
  "XkvKXtILlKsZu2WDbak/lg",
  "lI3aeHWTNAp68aGOMot7fw",
  "hiwAsuhU+cDx6NhAnSPYmQ",
  "EQqz4+TzeAkh6O5d3jNzrQ",
  "8MQ62soq/HHGzID4UbOIGA",
  "3Q4+C0BAg+xpYYqrtQuKwA",
  "AHnJByMGWZaPD8DkGmq8+Q",
  "SPfzzaUwMKh+jDh9jR5CZQ",
  "RyyOH7qg5hUg4CXCVbXRaA",
  "VSPxRPrvK/ygijyosr7Nag",
  "K2Pg5QY/2sz2aaHiY4Tz/Q",
  "VHuz7S3rhW0OO713wnuWJQ",
  "SlF3oXJ2S9pvRHK5S6F8yw",
  "xtIzvI6c/l2mkAWdJ9n4jw",
  "+rZGJX+UWwsqfOPhw+POXw",
  "lC9Cnqy4AV4Y2PWZls++5g",
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function log4shell(...args: MethodArgs): Promise<void> {
  console.log('log4shell lookup...');

  const signatures: Array<Signature> = new Array<Signature>();
  const paths: Path[] = await find('./');

  for (const path of paths) {
    const content = await readFile(path);
    if (path.includes('.jar')) {
      try {
        await handleJar(content, path, signatures);
      } catch (error) {
        console.error(`Error reading path ${path}. ${error}`);
      }
    }
  }

  const resultKeys = {};
  signatures.forEach((signature) => {
    const path = signature.path.replace(/(.*org\/apache\/logging\/log4j\/core).*/,"$1");
    resultKeys[path] = true;
  });

  const result = Object.keys(resultKeys);
  console.log("\nResults:");

  if (result.length == 0) {
    console.log("log4shell was not detected");
  } else {
    console.log("log4shell was detected: ");
    result.forEach((path) => {
      console.log(`\t ${path}`);
    });
  }
}


async function handleJar(content: FileContent, path: string, accumulator: Array<Signature>) {
  const hash = await computeHash(content);

  if (memtable.includes(hash)) {
    accumulator.push({
      hash,
      path
    });
  } else {
    const zip = new AdmZip(content);
    const entries = zip.getEntries();

    for (const entry of entries) {
      if (entry.isDirectory) {
        continue;
      }

      if (entry.entryName.includes('.jar')) {
        try {
          await handleJar(entry.getData(), path + '/' + entry.entryName, accumulator);
        } catch (error) {
          console.error(`Error reading path ${path + '/' + entry.entryName}. ${error}`);
        }
      }

      if (/^[^.]+.java|.class$/.test(entry.entryName)) {
        const content: FileContent = entry.getData();
        const hash = await computeHash(content);

        if (memtable.includes(hash)) {
          accumulator.push({
            hash,
            path: path + '/' + entry.entryName
          });
        }
      }
    }
  }

}

async function computeHash(content: FileContent) {
  const hash = crypto.createHash('md5').update(content);
  return hash.digest('base64').replace(/=/g, '');
}

async function find(path: Path): Promise<string[]> {
  const result: Path[] = [];

  await traverse(path, (filePath: string, stats: Stats) => {
    if (!stats.isFile() || stats.size > MAX_FILE_SIZE) {
      return;
    }
    result.push(filePath);
  });

  return result;
}

async function traverse(path: Path, handle: FileHandler) {
  try {
    const stats = await stat(path);

    if (!stats.isDirectory()) {
      handle(path, stats);
      return;
    }

    const entries = await readDir(path);
    for (const entry of entries) {
      const absolute = join(path, entry);
      await traverse(absolute, handle);
    }
  } catch (error) {
    console.error(`Error reading path ${path}. ${error}`);
  }
}