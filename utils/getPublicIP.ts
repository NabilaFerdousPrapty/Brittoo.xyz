// utils/getPublicIP.ts
export default async function getPublicIP(): Promise<string | null> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn("Could not fetch public IP", error);
    return null;
  }
}
