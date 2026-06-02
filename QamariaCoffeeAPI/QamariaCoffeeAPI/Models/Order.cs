using System;
using System.Collections.Generic;

namespace QamariaCoffeeAPI.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int? CustomerId { get; set; }

    public int? LocationId { get; set; }

    public DateTime? OrderDate { get; set; }

    public string? PaymentMethod { get; set; }

    public string? Status { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual Location? Location { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
