using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace QamariaCoffeeAPI.Models;

public partial class QamariaCoffeeDbContext : DbContext
{
    public QamariaCoffeeDbContext()
    {
    }

    public QamariaCoffeeDbContext(DbContextOptions<QamariaCoffeeDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Location> Locations { get; set; }

    public virtual DbSet<MenuItem> MenuItems { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=localhost;Database=QamariaCoffeeDb;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__Customer__A4AE64D8CB5E9095");

            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FirstName).HasMaxLength(50);
            entity.Property(e => e.LastName).HasMaxLength(50);
            entity.Property(e => e.Phone).HasMaxLength(20);
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.HasKey(e => e.LocationId).HasName("PK__Location__E7FEA497716E140B");

            entity.Property(e => e.Address).HasMaxLength(200);
            entity.Property(e => e.City).HasMaxLength(50);
            entity.Property(e => e.LocationName).HasMaxLength(100);
        });

        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasKey(e => e.ItemId).HasName("PK__MenuItem__727E838B6E2B886B");

            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.ItemName).HasMaxLength(100);
            entity.Property(e => e.Price).HasColumnType("decimal(6, 2)");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BCF37C5BCC6");

            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Orders__Customer__5070F446");

            entity.HasOne(d => d.Location).WithMany(p => p.Orders)
                .HasForeignKey(d => d.LocationId)
                .HasConstraintName("FK__Orders__Location__5165187F");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId).HasName("PK__OrderIte__57ED06815A0305D8");

            entity.HasOne(d => d.Item).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ItemId)
                .HasConstraintName("FK__OrderItem__ItemI__571DF1D5");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__OrderItem__Order__5629CD9C");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
