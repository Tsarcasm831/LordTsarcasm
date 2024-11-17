import tkinter as tk
from tkinter import messagebox
import random
import time
from datetime import datetime, timedelta

class BakeryGame:
    def __init__(self, root):
        self.root = root
        self.root.title("Bakery Game")
        
        # Game state
        self.score = 0
        self.game_duration = 300  # 5 minutes in seconds
        self.customer_interval = 300  # 5 minutes in seconds
        self.game_start_time = time.time()
        self.last_customer_time = time.time()
        self.current_order = None
        
        # Game data
        self.flavors = ["Vanilla", "Chocolate", "Strawberry"]
        self.fillings = ["Cream", "Chocolate", "Jam", "Custard", "Caramel"]
        self.toppings = ["Sprinkles", "Cherries", "Nuts", "Chocolate Chips", 
                        "Frosting", "Fruit", "Whipped Cream", "Cookie Crumbs"]
        
        self.setup_ui()
        self.update_game()
        
    def setup_ui(self):
        # Score and Timer
        self.info_frame = tk.Frame(self.root)
        self.info_frame.pack(pady=10)
        
        self.score_label = tk.Label(self.info_frame, text="Score: 0")
        self.score_label.pack(side=tk.LEFT, padx=10)
        
        self.timer_label = tk.Label(self.info_frame, text="Time: 5:00")
        self.timer_label.pack(side=tk.LEFT, padx=10)
        
        # Customer area
        self.customer_frame = tk.Frame(self.root)
        self.customer_frame.pack(pady=20)
        
        self.customer_label = tk.Label(self.customer_frame, text="No customer waiting")
        self.customer_label.pack()
        
        self.order_label = tk.Label(self.customer_frame, text="")
        self.order_label.pack()
        
        # Baking area
        self.baking_frame = tk.Frame(self.root)
        self.baking_frame.pack(pady=20)
        
        # Ingredients selection
        self.ingredient_frame = tk.Frame(self.baking_frame)
        self.ingredient_frame.pack()
        
        self.flavor_var = tk.StringVar(value=self.flavors[0])
        self.filling_var = tk.StringVar(value=self.fillings[0])
        self.topping_var = tk.StringVar(value=self.toppings[0])
        
        tk.OptionMenu(self.ingredient_frame, self.flavor_var, *self.flavors).pack(side=tk.LEFT, padx=5)
        tk.OptionMenu(self.ingredient_frame, self.filling_var, *self.fillings).pack(side=tk.LEFT, padx=5)
        tk.OptionMenu(self.ingredient_frame, self.topping_var, *self.toppings).pack(side=tk.LEFT, padx=5)
        
        # Baking steps
        self.steps_frame = tk.Frame(self.baking_frame)
        self.steps_frame.pack(pady=10)
        
        self.bake_btn = tk.Button(self.steps_frame, text="Mix & Bake", command=self.bake_cake)
        self.bake_btn.pack(side=tk.LEFT, padx=5)
        
        self.fill_btn = tk.Button(self.steps_frame, text="Add Filling", command=self.add_filling, state=tk.DISABLED)
        self.fill_btn.pack(side=tk.LEFT, padx=5)
        
        self.topping_btn = tk.Button(self.steps_frame, text="Add Topping", command=self.add_topping, state=tk.DISABLED)
        self.topping_btn.pack(side=tk.LEFT, padx=5)
        
        self.serve_btn = tk.Button(self.steps_frame, text="Serve", command=self.serve_cake, state=tk.DISABLED)
        self.serve_btn.pack(side=tk.LEFT, padx=5)
    
    def generate_order(self):
        flavor = random.choice(self.flavors)
        filling = random.choice(self.fillings)
        topping = random.choice(self.toppings)
        return {"flavor": flavor, "filling": filling, "topping": topping}
    
    def new_customer(self):
        self.current_order = self.generate_order()
        order_text = f"Order: {self.current_order['flavor']} cake with {self.current_order['filling']} filling and {self.current_order['topping']}"
        self.customer_label.config(text="New customer waiting!")
        self.order_label.config(text=order_text)
        self.reset_buttons()
    
    def reset_buttons(self):
        self.bake_btn.config(state=tk.NORMAL)
        self.fill_btn.config(state=tk.DISABLED)
        self.topping_btn.config(state=tk.DISABLED)
        self.serve_btn.config(state=tk.DISABLED)
    
    def bake_cake(self):
        self.bake_btn.config(state=tk.DISABLED)
        self.fill_btn.config(state=tk.NORMAL)
    
    def add_filling(self):
        self.fill_btn.config(state=tk.DISABLED)
        self.topping_btn.config(state=tk.NORMAL)
    
    def add_topping(self):
        self.topping_btn.config(state=tk.DISABLED)
        self.serve_btn.config(state=tk.NORMAL)
    
    def serve_cake(self):
        if (self.flavor_var.get() == self.current_order['flavor'] and
            self.filling_var.get() == self.current_order['filling'] and
            self.topping_var.get() == self.current_order['topping']):
            self.score += 100
            self.score_label.config(text=f"Score: {self.score}")
            messagebox.showinfo("Success!", "Perfect cake! Customer is happy!")
        else:
            messagebox.showinfo("Wrong Order", "The customer is not satisfied...")
        
        self.current_order = None
        self.customer_label.config(text="No customer waiting")
        self.order_label.config(text="")
        self.serve_btn.config(state=tk.DISABLED)
    
    def update_game(self):
        current_time = time.time()
        elapsed_time = current_time - self.game_start_time
        remaining_time = max(0, self.game_duration - elapsed_time)
        
        # Update timer display
        minutes = int(remaining_time // 60)
        seconds = int(remaining_time % 60)
        self.timer_label.config(text=f"Time: {minutes}:{seconds:02d}")
        
        # Check if it's time for a new customer
        if (current_time - self.last_customer_time >= 5 and  # Changed to 5 seconds for testing
            self.current_order is None):
            self.last_customer_time = current_time
            self.new_customer()
        
        # Check if game is over
        if remaining_time <= 0:
            messagebox.showinfo("Game Over", f"Final Score: {self.score}")
            self.root.quit()
            return
        
        self.root.after(1000, self.update_game)

if __name__ == "__main__":
    root = tk.Tk()
    game = BakeryGame(root)
    root.mainloop()
