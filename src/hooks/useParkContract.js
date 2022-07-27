import { useContract } from "./useContract";
import ABI from "../contracts/ParkNft-data.json";
import ADDRESS from "../contracts/ParkNft-address.json";

export const useParkContract = () =>
  useContract(ABI.abi, ADDRESS.Park);