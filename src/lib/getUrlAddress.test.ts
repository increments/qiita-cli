import { AddressInfo } from "net";
import { getUrlAddress } from "./getUrlAddress";

describe("getUrlAddress", () => {
  describe("when null is passed", () => {
    it("returns null", () => {
      const url = getUrlAddress(null);
      expect(url).toBeNull();
    });
  });

  describe("when string is passed", () => {
    it("returns null", () => {
      const url = getUrlAddress("foobar");
      expect(url).toBeNull();
    });
  });

  describe("when IPv4 is passed", () => {
    it("returns correct url", () => {
      const address: AddressInfo = {
        address: "0.0.0.0",
        family: "IPv4",
        port: 8888,
      };
      const url = getUrlAddress(address);
      expect(url).toEqual(`http://${address.address}:${address.port}`);
    });
  });

  describe("when IPv6 is passed", () => {
    it("returns correct url", () => {
      const address: AddressInfo = {
        address: "::",
        family: "IPv6",
        port: 8888,
      };
      const url = getUrlAddress(address);
      expect(url).toEqual(`http://[${address.address}]:${address.port}`);
    });
  });
});
