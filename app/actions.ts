"use server";

export async function testServerAction(): Promise<string> {
  return `Server time: ${new Date().toISOString()}`;
}
