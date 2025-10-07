import { Helmet } from "react-helmet-async";
import { generatePageTitle } from "@/utils/utils";
import { TradingRewards } from "@orderly.network/trading-rewards";
import { getRuntimeConfig } from "@/utils/runtime-config";

export default function RewardsTrading() {
  return (
    <>
      <Helmet>
        <title>{generatePageTitle("Trading Rewards")}</title>
      </Helmet>
      <div className="oui-py-6 oui-px-4 lg:oui-px-6 xl:oui-pl-4 lx:oui-pr-6">
        <TradingRewards.HomePage
          titleConfig={{
            brokerName: getRuntimeConfig('VITE_ORDERLY_BROKER_NAME'),
            docOpenOptions: {
              url: "https://orderly.network/docs/introduction/tokenomics/trading-rewards/trading-rewards",
            }
          }}
        />
      </div>
    </>
  );
}

