#!/usr/bin/env node
import process from 'node:process';
import { runCli } from '../dist/index.js';

runCli(process.argv);
