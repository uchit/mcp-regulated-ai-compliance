/**
 * Resources: hellouchit://dataset/*
 *
 * Exposes the regulation × control × tooling dataset as MCP resources.
 * URIs:
 *   hellouchit://dataset/full
 *   hellouchit://dataset/regulation/{slug}
 *   hellouchit://dataset/category/{name}
 */

import { getDataset } from "../lib/retrieval.js";

export const datasetResources = {
  list(): Array<{ uri: string; name: string; description: string; mimeType: string }> {
    const ds = getDataset();
    const resources = [
      {
        uri: "hellouchit://dataset/full",
        name: "Full regulation × control × tooling dataset",
        description: `${ds.rows.length} controls × ${Object.keys(ds.regulations).length} regulations × 261 tools. Source-of-truth dataset. CC BY 4.0.`,
        mimeType: "application/json",
      },
    ];

    // Per-regulation resources
    for (const [slug, meta] of Object.entries(ds.regulations)) {
      resources.push({
        uri: `hellouchit://dataset/regulation/${slug}`,
        name: `${meta.label} controls`,
        description: `All controls in the dataset mandated by ${meta.label} (${meta.jurisdiction}).`,
        mimeType: "application/json",
      });
    }

    // Per-category resources
    const categories = new Set(ds.rows.map(r => r.cat));
    for (const cat of categories) {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      resources.push({
        uri: `hellouchit://dataset/category/${slug}`,
        name: `Controls in category: ${cat}`,
        description: `All controls in the dataset under category '${cat}'.`,
        mimeType: "application/json",
      });
    }

    return resources;
  },

  read(uri: string): { uri: string; mimeType: string; text: string } | null {
    const ds = getDataset();

    if (uri === "hellouchit://dataset/full") {
      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(ds, null, 2),
      };
    }

    const regMatch = uri.match(/^hellouchit:\/\/dataset\/regulation\/(.+)$/);
    if (regMatch) {
      const slug = regMatch[1];
      const rows = ds.rows.filter(r => r.reg.includes(slug ?? ""));
      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(
          {
            regulation: slug,
            label: slug ? ds.regulations[slug]?.label : undefined,
            jurisdiction: slug ? ds.regulations[slug]?.jurisdiction : undefined,
            row_count: rows.length,
            rows,
          },
          null,
          2
        ),
      };
    }

    const catMatch = uri.match(/^hellouchit:\/\/dataset\/category\/(.+)$/);
    if (catMatch) {
      const slug = catMatch[1];
      const rows = ds.rows.filter(
        r => r.cat.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
      );
      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(
          { category_slug: slug, row_count: rows.length, rows },
          null,
          2
        ),
      };
    }

    return null;
  },
};
