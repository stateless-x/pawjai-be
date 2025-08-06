#!/usr/bin/env bun
// === SEED RUNNER ===
// Command-line tool for running database seeds

import { runSeeds, seedBreeds, seedUserProfiles, seedUserPersonalization, seedPets, factoryReset } from './index';

async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options = {
    clearExisting: args.includes('--clear') || args.includes('-c'),
    skipBreeds: args.includes('--skip-breeds') || args.includes('--no-breeds'),
    skipUsers: args.includes('--skip-users') || args.includes('--no-users'),
    skipPets: args.includes('--skip-pets') || args.includes('--no-pets'),
    skipSetup: args.includes('--skip-setup') || args.includes('--no-setup'),
    breedsOnly: args.includes('--breeds') || args.includes('-b'),
    usersOnly: args.includes('--users') || args.includes('-u'),
    petsOnly: args.includes('--pets') || args.includes('-p'),
    factoryReset: args.includes('--factory-reset') || args.includes('--reset') || args.includes('-r'),
    setupFirst: args.includes('--setup-first') || args.includes('--setup'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (options.help) {
    console.log(`
🌱 PawJai Database Seeder

Usage:
  bun run src/seed/run.ts [options]

Options:
  --clear, -c              Clear existing data before seeding
  --factory-reset, --reset, -r  Clear ALL data from database (factory reset)
  --setup-first, --setup   Run database setup before factory reset
  --breeds, -b             Seed only breeds
  --users, -u              Seed only users (profiles + personalization)
  --pets, -p               Seed only pets
  --skip-breeds            Skip seeding breeds
  --skip-users             Skip seeding users
  --skip-pets              Skip seeding pets
  --skip-setup             Skip database setup (assumes tables exist)
  --help, -h               Show this help message

Examples:
  bun run src/seed/run.ts                    # Seed everything
  bun run src/seed/run.ts --clear            # Clear and seed everything
  bun run src/seed/run.ts --factory-reset    # Clear ALL data (factory reset)
  bun run src/seed/run.ts --factory-reset --setup-first  # Setup DB then reset
  bun run src/seed/run.ts --breeds           # Seed only breeds
  bun run src/seed/run.ts --users --clear    # Clear and seed only users
  bun run src/seed/run.ts --skip-pets        # Seed everything except pets

⚠️  WARNING: --factory-reset will permanently delete ALL data!
`);
    process.exit(0);
  }

  try {
    // Handle factory reset
    if (options.factoryReset) {
      console.log('⚠️  WARNING: This will permanently delete ALL data from the database!');
      console.log('🗑️  Proceeding with factory reset...');
      
      // Run setup first if requested
      if (options.setupFirst) {
        console.log('🔧 Running database setup first...');
        const { setupDatabase } = await import('./index');
        await setupDatabase();
      }
      
      await factoryReset();
      return;
    }

    // Run specific seeds if requested
    if (options.breedsOnly) {
      console.log('🌱 Seeding breeds only...');
      await seedBreeds({ clearExisting: options.clearExisting });
      return;
    }

    if (options.usersOnly) {
      console.log('🌱 Seeding users only...');
      await seedUserProfiles({ clearExisting: options.clearExisting });
      await seedUserPersonalization({ clearExisting: options.clearExisting });
      return;
    }

    if (options.petsOnly) {
      console.log('🌱 Seeding pets only...');
      await seedPets({ clearExisting: options.clearExisting });
      return;
    }

    // Run all seeds with options
    await runSeeds({
      clearExisting: options.clearExisting,
      skipBreeds: options.skipBreeds,
      skipUsers: options.skipUsers,
      skipPets: options.skipPets,
      skipSetup: options.skipSetup
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seeder
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
}); 