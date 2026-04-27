'use client';

import { ProductStatus } from '@repo/api/fe';
import { Badge } from '@repo/ui/components/ui/badge';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/ui/table';
import { cn } from '@repo/ui/lib/utils';
import { useProducts } from '@/hooks/use-products';

const STATUS_VARIANT: Record<ProductStatus, 'default' | 'secondary' | 'outline' | 'destructive'> =
  {
    [ProductStatus.ACTIVE]: 'default',
    [ProductStatus.INACTIVE]: 'secondary',
    [ProductStatus.DRAFT]: 'outline',
    [ProductStatus.OUT_OF_STOCK]: 'destructive',
  };

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function ProductsClient() {
  const { data, isLoading, isError } = useProducts();

  const items = data?.data ?? [];
  const total = data?.meta?.totalItems ?? items.length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        {!isLoading && (
          <Badge variant="secondary" className={cn('tabular-nums')}>
            {total}
          </Badge>
        )}
      </div>

      {isError && (
        <p className="text-sm text-destructive">Failed to load products. Please try again.</p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : (
            items.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[product.status]}>{product.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.categoryId ?? '—'}
                </TableCell>
              </TableRow>
            ))
          )}
          {!isLoading && !isError && items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </main>
  );
}
