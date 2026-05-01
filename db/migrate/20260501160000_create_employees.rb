class CreateEmployees < ActiveRecord::Migration[7.1]
  def change
    create_table :employees do |t|
      t.string :full_name, null: false
      t.string :email, null: false
      t.string :job_title, null: false
      t.string :country, null: false
      t.decimal :salary, precision: 15, scale: 2, null: false
      t.string :status, default: 'active'

      t.timestamps
    end
    add_index :employees, :email, unique: true
    add_index :employees, :country
    add_index :employees, [:country, :job_title]
  end
end
