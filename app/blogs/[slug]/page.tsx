import { notFound } from "next/navigation";
import { allBlogs } from "contentlayer/generated";
import { Mdx } from "@/app/components/mdx";
import { Header } from "./header";
import "./mdx.css";
import { BlogView } from "./view";
import { Redis } from "@upstash/redis";

export const revalidate = 60;

type Props = {
	params: {
		slug: string;
	};
};

const redis = Redis.fromEnv();

export async function generateStaticParams(): Promise<Props["params"][]> {
	return allBlogs
		.filter((b) => b.published)
		.map((b) => ({
			slug: b.slug,
		}));
}

export default async function BlogPage({ params }: Props) {
	const slug = params?.slug;
	const blog = allBlogs.find((blog) => blog.slug === slug);

	if (!blog) {
		notFound();
	}

	const views =
		(await redis.get<number>(["pageviews", "blogs", slug].join(":"))) ?? 0;

	return (
		<div className="bg-zinc-50 min-h-screen">
			<Header blog={blog} views={views} />
			<BlogView slug={blog.slug} />

			<article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
				<Mdx code={blog.body.code} />
			</article>
		</div>
	);
}
