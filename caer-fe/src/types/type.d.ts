interface SupplyDialogProps {
  poolId: number;
  token: string;
  apy: string;
}

interface AssetItem {
  id: string;
  name: string;
  network: string;
  icon: string;
  available: number;
  apy: number;
  borrowed?: number;
}

interface PositionTokenProps {
  name: string | undefined;
  address: Address;
  decimal: number;
  addressPosition: Address | undefined;
}
export interface Chain {
  id: number;
  name: string;
  type: string;
  logoUrl: string;
}

export { SupplyDialogProps, AssetItem, PositionTokenProps };
