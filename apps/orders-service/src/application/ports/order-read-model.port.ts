import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import type { OrderDetailDto, OrderSummaryDto } from '../dto/order.dto';

export interface ListOrdersFilter {
  customerId?: string;
  status?: string;
}

export abstract class OrderReadModelPort {
  abstract findById(id: string): Promise<OrderDetailDto | null>;
  abstract findByIdForCustomer(
    id: string,
    customerId: string,
  ): Promise<OrderDetailDto | null>;
  abstract list(
    page: PageRequestDto,
    filter?: ListOrdersFilter,
  ): Promise<PagedResultDto<OrderSummaryDto>>;
}
