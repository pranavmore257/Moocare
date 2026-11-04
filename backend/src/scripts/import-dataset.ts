import dotenv from 'dotenv';
dotenv.config();

import path from 'node:path';
import fs from 'node:fs';
import { connectDB, disconnectDB } from '../config/db.js';
import { DatasetImporterService } from '../services/datasetImporterService.js';

async function run() {
  const args = process.argv.slice(2);

  // Parse CLI args: --file=<path>, --name=<datasetName>, --no-sync
  let filePath = '';
  let datasetName = 'CLI Ingested Dataset';
  let syncCattle = true;

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      filePath = arg.replace('--file=', '').trim();
    } else if (arg.startsWith('--name=')) {
      datasetName = arg.replace('--name=', '').trim();
    } else if (arg === '--no-sync') {
      syncCattle = false;
    }
  }

  if (!filePath) {
    console.error('\n❌ Error: Please specify a dataset file using --file=<path>');
    console.log('\nUsage Examples:');
    console.log('  npm run dataset:import -- --file=data/sample-dataset.csv');
    console.log('  npm run dataset:import -- --file=data/sample-dataset.json --name="Kaggle Cattle Distress 2026"');
    console.log('  npm run dataset:import -- --file=path/to/my-dataset.csv --no-sync\n');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`\n❌ Error: File not found at path: ${resolvedPath}\n`);
    process.exit(1);
  }

  const ext = path.extname(resolvedPath).toLowerCase();

  try {
    console.log(`\n======================================================`);
    console.log(`📦 MooCare AI Dataset Ingestion CLI`);
    console.log(`📂 Source File:   ${resolvedPath}`);
    console.log(`🏷️ Dataset Name:  ${datasetName}`);
    console.log(`🐄 Sync to Herd:  ${syncCattle ? 'Yes' : 'No'}`);
    console.log(`======================================================\n`);

    console.log('[Dataset CLI] Connecting to MongoDB...');
    await connectDB();

    console.log('[Dataset CLI] Parsing and ingesting records...');

    let result;
    if (ext === '.csv') {
      result = await DatasetImporterService.importCsv(resolvedPath, datasetName, syncCattle);
    } else if (ext === '.json') {
      const fileData = fs.readFileSync(resolvedPath, 'utf8');
      const parsed = JSON.parse(fileData);
      const records = Array.isArray(parsed) ? parsed : (parsed.samples || parsed.data || [parsed]);
      result = await DatasetImporterService.importJson(records, datasetName, syncCattle);
    } else {
      console.error(`❌ Error: Unsupported file format "${ext}". Supported: .csv, .json`);
      process.exit(1);
    }

    console.log('\n🎉 [Dataset CLI] Ingestion Complete!');
    console.log(`------------------------------------------------------`);
    console.log(`Total Rows Processed:   ${result.totalProcessed}`);
    console.log(`Inserted / Updated:     ${result.inserted}`);
    console.log(`Cattle Added to Herd:   ${result.cattleCreated}`);
    console.log(`Errors / Skipped:       ${result.errors}`);
    console.log(`Health Label Breakdown:`, result.labelBreakdown);
    console.log(`------------------------------------------------------\n`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error during dataset import:', error);
    process.exit(1);
  }
}

run();
