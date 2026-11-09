using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolAdmission.Domain.Entities;

namespace SchoolAdmission.Infrastructure.Persistence.Configurations
{
    public sealed class SchoolClassConfiguration : IEntityTypeConfiguration<SchoolClass>
    {
        public void Configure(EntityTypeBuilder<SchoolClass> builder)
        {
            builder.ToTable("classes", t =>
                t.HasCheckConstraint("ck_classes_total_seats", "total_seats > 0"));

            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id).UseIdentityByDefaultColumn();

            builder.Property(c => c.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            builder.Property(c => c.TotalSeats).HasColumnName("total_seats").IsRequired();
            builder.Property(c => c.CreatedAt).HasColumnName("created_at").IsRequired();

            // Navigation: one class has many holds.
            builder.HasMany(c => c.Holds)
                   .WithOne(h => h.Class)
                   .HasForeignKey(h => h.ClassId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}