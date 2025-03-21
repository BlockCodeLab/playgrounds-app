import { default as Konva } from 'konva';

Konva.pixelRatio = 2;

// 计算叉积
function crossProduct(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

// 从像素数据中提取所有区域
function extractRegionsFromImageData(imageData) {
  const { width, height, data } = imageData;
  const visited = new Array(width * height).fill(false); // 标记是否访问过
  const regions = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (!visited[index] && data[index * 4 + 3] > 0) {
        // 找到一个新的区域
        const region = [];
        const stack = [[x, y]];
        while (stack.length > 0) {
          const [cx, cy] = stack.pop();
          const cIndex = cy * width + cx;
          if (!visited[cIndex] && data[cIndex * 4 + 3] > 0) {
            visited[cIndex] = true;
            region.push({ x: cx, y: cy });
            // 检查相邻像素
            if (cx > 0) stack.push([cx - 1, cy]);
            if (cx < width - 1) stack.push([cx + 1, cy]);
            if (cy > 0) stack.push([cx, cy - 1]);
            if (cy < height - 1) stack.push([cx, cy + 1]);
          }
        }
        regions.push(region);
      }
    }
  }

  return regions;
}

// 计算凸包（Graham Scan 算法）
function computeConvexHull(points) {
  if (points.length <= 3) return points;

  // 找到最低点（最左下角的点）
  let lowestPoint = points[0];
  for (const point of points) {
    if (point.y > lowestPoint.y || (point.y === lowestPoint.y && point.x < lowestPoint.x)) {
      lowestPoint = point;
    }
  }

  // 按极角排序
  points.sort((a, b) => {
    const angleA = Math.atan2(a.y - lowestPoint.y, a.x - lowestPoint.x);
    const angleB = Math.atan2(b.y - lowestPoint.y, b.x - lowestPoint.x);
    return angleA - angleB;
  });

  // 构建凸包
  const hull = [];
  for (const point of points) {
    while (hull.length >= 2 && crossProduct(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
      hull.pop();
    }
    hull.push(point);
  }

  return hull;
}

// 更新凸包位置（考虑旋转和缩放）
function updateConvexHulls(target) {
  const x = target.x();
  const y = target.y();
  const offsetX = target.offsetX();
  const offsetY = target.offsetY();
  const scaleX = target.scaleX(); // 缩放因子
  const scaleY = target.scaleY();
  const rotation = (target.rotation() * Math.PI) / 180; // 旋转角度（弧度）
  const sinRotation = Math.sin(rotation);
  const cosRotation = Math.cos(rotation);

  const convexHulls = target.getAttr('convex-hulls');

  // 更新凸包点
  const updatedHulls = convexHulls.map((hull, index) => {
    const updatedHull = hull.map((p) => {
      // 缩放
      const scaledX = (p.x - offsetX) * scaleX;
      const scaledY = (p.y - offsetY) * scaleY;

      // 旋转
      const rotatedX = scaledX * cosRotation - scaledY * sinRotation;
      const rotatedY = scaledX * sinRotation + scaledY * cosRotation;

      // 平移
      return {
        x: rotatedX + x,
        y: rotatedY + y,
      };
    });
    return updatedHull;
  });
  return updatedHulls;
}

// 投影凸包到法向量
function projectHull(hull, normal) {
  let min = Infinity;
  let max = -Infinity;
  for (const point of hull) {
    const projected = point.x * normal.x + point.y * normal.y;
    min = Math.min(min, projected);
    max = Math.max(max, projected);
  }
  return { min, max };
}

// 检测单个凸包碰撞
function checkSingleConvexHullCollision(hullA, hullB) {
  const hulls = [hullA, hullB];
  for (let i = 0; i < hulls.length; i++) {
    const hull = hulls[i];
    for (let j = 0; j < hull.length; j++) {
      const p1 = hull[j];
      const p2 = hull[(j + 1) % hull.length];
      const normal = { x: p2.y - p1.y, y: p1.x - p2.x };

      const projectedA = projectHull(hullA, normal);
      const projectedB = projectHull(hullB, normal);

      if (projectedA.max < projectedB.min || projectedB.max < projectedA.min) {
        return false;
      }
    }
  }
  return true;
}

// 计算图片所有凸包
export function computeConvexHulls(imageData) {
  // 提取所有区域
  const regions = extractRegionsFromImageData(imageData);
  // 计算每个区域的凸包
  const convexHulls = regions.map((region) => computeConvexHull(region));
  return convexHulls;
}

export class KonvaUtils {
  // 计算图片所有凸包
  static computeConvexHulls(target, image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const convexHulls = computeConvexHulls(imageData); // 计算每个区域的凸包
    target.setAttr('convex-hulls', convexHulls);
  }

  // 分离轴定理（SAT）检测凸包碰撞
  static checkConvexHullsCollision(targetA, targetB) {
    const hullsA = updateConvexHulls(targetA);
    const hullsB = updateConvexHulls(targetB);

    for (const hullA of hullsA) {
      for (const hullB of hullsB) {
        if (checkSingleConvexHullCollision(hullA, hullB)) {
          return true;
        }
      }
    }
    return false;
  }
}
