using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolAdmission.Domain.Entities;

namespace SchoolAdmission.Infrastructure.Persistence.Configurations
{
    public sealed class HoldConfiguration : IEntityTypeConfiguration<Hold>
    {
        public void Configure(EntityTypeBuilder<Hold> builder)
        {
            builder.ToTable("holds", t =>
            {
                t.HasCheckConstraint("ck_holds_student_id", "student_id ~ '^[0-9]{17}$'");
                t.HasCheckConstraint("ck_holds_status",
                    "status IN ('HELD','CONFIRMED','EXPIRED','CANCELLED')");
                t.HasCheckConstraint("ck_holds_confirmed",
                    "(status = 'CONFIRMED') = (confirmed_at IS NOT NULL)");
                t.HasCheckConstraint("ck_holds_cancelled",
                    "(status = 'CANCELLED') = (cancelled_at IS NOT NULL)");
            });

            builder.HasKey(h => h.Id);
            builder.Property(h => h.Id).UseIdentityByDefaultColumn();

            builder.Property(h => h.ClassId).HasColumnName("class_id").IsRequired();
            builder.Property(h => h.StudentId).HasColumnName("student_id").HasMaxLength(17).IsFixedLength().IsRequired();
            builder.Property(h => h.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20).IsRequired();
            builder.Property(h => h.CreatedAt).HasColumnName("created_at").IsRequired();
            builder.Property(h => h.ExpiresAt).HasColumnName("expires_at").IsRequired();
            builder.Property(h => h.ConfirmedAt).HasColumnName("confirmed_at");
            builder.Property(h => h.CancelledAt).HasColumnName("cancelled_at");

            // One active application per student per class. EXPIRED and CANCELLED are excluded.
            builder.HasIndex(h => new { h.ClassId, h.StudentId })
                   .IsUnique()
                   .HasFilter("status IN ('HELD','CONFIRMED')")
                   .HasDatabaseName("one_active_per_student_class");

            builder.HasIndex(h => new { h.StudentId, h.CreatedAt })
                   .HasDatabaseName("holds_student_idx");

            builder.HasIndex(h => new { h.ClassId, h.Status })
                   .HasDatabaseName("holds_class_status_idx");
        }
    }
}