using System;
using System.Collections.Generic;

namespace QamariaCoffeeAPI.Models;

public partial class MenuItem
{
    public int ItemId { get; set; }

    public string ItemName { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? Category { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
