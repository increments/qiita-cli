import { AddressInfo } from "net";


export const getUrlAddress = (address: string | AddressInfo | null) => {
  if (!address || typeof address === "string") return null;

  if (["IPv4", "IPv6"].indexOf(address.family) === -1) throw new Error("Unknown address family");

  return `http://${address.family === "IPv4" ? address.address : `[${address.address}]`}:${address.port}`;
}