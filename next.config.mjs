/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出模式：npm run build 后生成 out/ 目录，可直接部署到任意静态服务器
  output: 'export',
  images: {
    // 静态导出下 next/image 不做图片优化，按原图输出
    unoptimized: true,
  },
  // 如果你部署到 GitHub Pages 的项目站点（如 https://用户名.github.io/仓库名/），
  // 需要取消注释下面这行并把路径改成你的仓库名：
  // basePath: '/self-web2',
}

export default nextConfig
