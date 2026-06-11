import { describe } from 'node:test';

async function testAppController() {
  try {
    await describe('AppController', () => {});
  } catch (error) {
    console.error(error);
  }
}

void testAppController();
