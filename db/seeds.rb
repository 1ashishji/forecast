puts "Loading name files..."
first_names = File.readlines(Rails.root.join('db', 'first_names.txt')).map(&:strip)
last_names = File.readlines(Rails.root.join('db', 'last_names.txt')).map(&:strip)

countries = ["USA", "UK", "Canada", "Germany", "India", "Australia", "Japan", "France", "Brazil", "South Africa"]
job_titles = ["Software Engineer", "Senior Developer", "Product Manager", "Data Scientist", "UI/UX Designer", "DevOps Engineer", "Project Manager", "Sales Executive", "Marketing Specialist", "Human Resources"]

puts "Cleaning up existing employees..."
Employee.delete_all

puts "Generating 10,000 employees..."
employees = []
total_to_create = 10_000
batch_size = 1000

(1..total_to_create).each do |i|
  first_name = first_names.sample
  last_name = last_names.sample
  
  employees << {
    first_name: first_name,
    last_name: last_name,
    email: "#{first_name.downcase}.#{last_name.downcase}.#{i}@example.com",
    job_title: job_titles.sample,
    country: countries.sample,
    salary: rand(40000..180000).to_d,
    status: 'active',
    created_at: Time.now,
    updated_at: Time.now
  }

  if employees.size >= batch_size
    Employee.insert_all(employees)
    employees = []
    puts "Inserted #{i} employees..."
  end
end

# Final batch
Employee.insert_all(employees) if employees.any?

puts "Seeding complete! Total employees: #{Employee.count}"
