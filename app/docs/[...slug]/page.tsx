import { DocPage } from "@/components/docs/doc-page";

export default async function DocsSlugPage(
    props: PageProps<"/docs/[...slug]">,
) {
    const { slug } = await props.params;
    return <DocPage slugParts={slug} />;
}
