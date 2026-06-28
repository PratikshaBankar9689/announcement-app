import { useState } from "react";
import { data } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
import { Page, Card, TextField, Button, Banner, BlockStack, Text, DataTable, InlineStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { connectDB } from "../server/db.server";
import Announcement from "../server/models/Announcement.server";

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  await connectDB();
  const history = await Announcement.find({ shop: session.shop })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  return data({ history });
}

export async function action({ request }: { request: Request }) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const text = formData.get("text") as string;

  if (!text || text.trim() === "") {
    return data({ error: "Announcement text cannot be empty." }, { status: 400 });
  }

  try {
    const shopRes = await admin.graphql(`#graphql
      query { shop { id } }
    `);
    const shopJson = await shopRes.json();
    const shopId = shopJson.data.shop.id;

    const metafieldRes = await admin.graphql(
      `#graphql
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { key namespace value }
          userErrors { field message }
        }
      }`,
      {
        variables: {
          metafields: [{
            namespace: "my_app",
            key: "announcement",
            value: text.trim(),
            type: "single_line_text_field",
            ownerId: shopId,
          }],
        },
      }
    );

    const metafieldJson = await metafieldRes.json();
    const userErrors = metafieldJson.data?.metafieldsSet?.userErrors;
    if (userErrors && userErrors.length > 0) {
      return data({ error: userErrors[0].message }, { status: 400 });
    }

    await connectDB();
    await Announcement.create({ shop: session.shop, text: text.trim() });

    return data({ success: true, message: "✅ Announcement saved!" });

  } catch (err) {
    console.error(err);
    return data({ error: "Something went wrong." }, { status: 500 });
  }
}

export default function Index() {
  const { history } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [text, setText] = useState("");

  const isLoading = fetcher.state !== "idle";
  const actionData = fetcher.data as any;

  const handleSave = () => {
    if (!text.trim()) return;
    fetcher.submit({ text }, { method: "POST" });
    setText("");
  };

  const rows = (history as any[]).map((item) => [
    item.text,
    new Date(item.createdAt).toLocaleString(),
  ]);

  return (
    <Page title="Store Announcement Manager">
      <BlockStack gap="500">

        {actionData?.success && (
          <Banner tone="success" title={actionData.message} />
        )}
        {actionData?.error && (
          <Banner tone="critical" title={actionData.error} />
        )}

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">Set Announcement Banner</Text>
            <Text tone="subdued" as="p">
              This text will appear as a banner on your storefront.
            </Text>
            <TextField
              label="Announcement Text"
              value={text}
              onChange={setText}
              placeholder='e.g. "🎉 Sale 50% Off this weekend!"'
              autoComplete="off"
            />
            <InlineStack align="end">
              <Button
                variant="primary"
                onClick={handleSave}
                loading={isLoading}
                disabled={!text.trim()}
              >
                Save Announcement
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>

        {rows.length > 0 && (
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd" as="h2">Announcement History</Text>
              <DataTable
                columnContentTypes={["text", "text"]}
                headings={["Announcement Text", "Saved At"]}
                rows={rows}
              />
            </BlockStack>
          </Card>
        )}

      </BlockStack>
    </Page>
  );
}