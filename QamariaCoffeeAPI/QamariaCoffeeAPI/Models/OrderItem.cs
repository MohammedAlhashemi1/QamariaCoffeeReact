using System;
using System.Collections.Generic;

namespace QamariaCoffeeAPI.Models;

public partial class OrderItem
{
    public int OrderItemId { get; set; }

    public int? OrderId { get; set; }

    public int? ItemId { get; set; }

    public int Quantity { get; set; }

    public virtual MenuItem? Item { get; set; }

    public virtual Order? Order { get; set; }
}
