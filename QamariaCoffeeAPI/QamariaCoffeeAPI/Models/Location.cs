using System;
using System.Collections.Generic;

namespace QamariaCoffeeAPI.Models;

public partial class Location
{
    public int LocationId { get; set; }

    public string LocationName { get; set; } = null!;

    public string? Address { get; set; }

    public string? City { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
