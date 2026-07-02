import { getQiitaApiInstance } from "../lib/get-qiita-api-instance";
import { PostingCampaign } from "../qiita-api";

const PER_PAGE = 100;

const formatDate = (isoString: string) =>
  new Date(isoString).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Tokyo",
  });

const isOngoing = (campaign: PostingCampaign) => {
  const now = new Date();
  const startAt = new Date(campaign.start_at);

  return startAt <= now;
};

export const postingCampaigns = async () => {
  const chalk = (await import("chalk")).default;
  const qiitaApi = await getQiitaApiInstance();

  const campaigns = (await qiitaApi.postingCampaigns(1, PER_PAGE)).filter(
    isOngoing,
  );

  if (campaigns.length === 0) {
    console.log("開催中の記事投稿キャンペーンはありません");
    return;
  }

  campaigns.forEach((campaign: PostingCampaign, index) => {
    if (index > 0) console.log("");

    console.log(chalk.bold(campaign.title));
    console.log(`  UUID:               ${campaign.uuid}`);
    console.log(
      `  期間:               ${formatDate(campaign.start_at)} 〜 ${formatDate(
        campaign.end_at,
      )}`,
    );
    console.log(`  キャンペーンページ: ${campaign.link_url}`);
    console.log(`  規約:               ${campaign.term_url}`);
  });
};
