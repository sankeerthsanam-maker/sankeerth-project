import sys
import json
import unittest
import threading
from unittest.mock import Mock
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'apps/voice-service'))
from assistant import products
from advisor import advise,validate_plan,context_from,response_is_grounded

class AdviserTest(unittest.TestCase):
    def setUp(self):
        self.catalogue=products()
    def plan(self, **changes):
        return {'intent':'details','ids':['halo'],'recommendedId':'halo','preferences':{},'focusedProductId':'halo','question':None,'execute':False,'quantity':1,**changes}
    def run_adviser(self, query, outputs, history=None, cart=None, page=None):
        generate=Mock(side_effect=outputs)
        reply=advise(query,history or [],cart or [],threading.Event(),self.catalogue,generate,page)
        return reply,generate
    def test_product_voice_add_this_resolves_the_active_product(self):
        reply,_=self.run_adviser('please add this to my bag',['{"action":"add","quantity":1}','{"execute":true}'],page='form')
        self.assertEqual(reply['action']['productId'],'form')
    def test_product_voice_buy_this_reuses_the_active_item(self):
        reply,_=self.run_adviser('buy this please',['{"action":"checkout"}','{"execute":true}'],cart=[{'productId':'form','quantity':1}],page='form')
        self.assertEqual(reply['action']['productId'],'form')
        self.assertFalse(reply['action']['addProduct'])

    def test_named_add_executes_without_general_recommendation_plan(self):
        reply,generate=self.run_adviser('add air one in the cart',['{"action":"add","quantity":1}','{"execute":true}'])
        self.assertEqual(reply['action']['type'],'add')
        self.assertEqual(reply['action']['productId'],'air')
        self.assertEqual(reply['text'],'Added 1 × Air One to your bag.')
        self.assertEqual(generate.call_count,2)
    def test_permission_question_cannot_execute_even_if_plan_says_add(self):
        reply,generate=self.run_adviser('can I add Air One?',[json.dumps(self.plan(intent='add',execute=True)), 'You can choose a product and select Checkout.'])
        self.assertNotIn('action',reply)
        self.assertEqual(generate.call_count,2)

    def test_named_how_to_does_not_change_the_bag(self):
        reply,_=self.run_adviser('how do I add Air One?',[json.dumps(self.plan(intent='instructions')),'Add a product to your bag and select Checkout.'])
        self.assertNotIn('action',reply)
    def test_named_classifier_requires_independent_authorization(self):
        reply,_=self.run_adviser('do not add Air One',[json.dumps(self.plan(intent='add',execute=True))])
        self.assertNotIn('action',reply)
    def test_named_checkout_reuses_existing_product(self):
        reply,_=self.run_adviser('please buy Air One',['{"action":"checkout"}','{"execute":true}'],cart=[{'productId':'air','quantity':1}])
        self.assertEqual(reply['action']['type'],'checkout')
        self.assertFalse(reply['action']['addProduct'])
    def test_oversized_named_quantity_cannot_execute(self):
        reply,_=self.run_adviser('add 99 Air One',['{"action":"add","quantity":99}',json.dumps(self.plan(intent='clarify',ids=[],question='How many would you like?')),'How many would you like?'])
        self.assertNotIn('action',reply)

    def test_natural_details_are_model_led(self):
        text='Halo Studio offers adaptive noise cancellation and a listed forty-hour battery. How will you mainly use it?'
        reply,generate=self.run_adviser('would this work well for my daily train ride?', ['{"action":"none"}',json.dumps(self.plan()),text],page='halo')
        self.assertEqual(reply['text'],text)
        self.assertEqual(reply['source'],'qwen-adviser')
        self.assertIn('currentProductId',generate.call_args_list[1].args[1])
        self.assertNotIn('action',reply)
    def test_negative_constraints_filter_model_choices(self):
        plan=self.plan(intent='recommend',ids=['halo','air-sport'],preferences={'anc':False,'category':'Earbuds','budget':7000})
        checked=validate_plan(plan,self.catalogue)
        self.assertEqual(checked.ids,['air-sport'])
        self.assertIsNone(checked.recommendedId)
    def test_unknown_tool_product_and_quantity_rejected(self):
        with self.assertRaises(ValueError): validate_plan(self.plan(ids=['invented']),self.catalogue)
        with self.assertRaises(ValueError): validate_plan(self.plan(quantity=99),self.catalogue)
    def test_instructions_never_execute_even_if_model_sets_flag(self):
        plan=self.plan(intent='instructions',execute=True)
        reply,_=self.run_adviser('how do i oder',[json.dumps(plan),'Choose a product, add it to your bag, then open Checkout. Enter name and email and press Place mock order. No payment is taken.'])
        self.assertEqual(reply['ids'],[])
        self.assertNotIn('action',reply)
    def test_omitted_recommendation_uses_only_matching_catalogue_items(self):
        checked=validate_plan(self.plan(intent='recommend',ids=[],recommendedId=None,preferences={'anc':False,'category':'Earbuds','budget':7000}),self.catalogue)
        self.assertEqual(checked.ids,['air-sport'])
        self.assertEqual(checked.recommendedId,'air-sport')

    def test_unresolved_clarification_invalidates_old_recommendation(self):
        history=[{'role':'assistant','text':'Please clarify','ids':[], 'advisorState':{'focusedProductId':'halo','needsClarification':True}},{'role':'assistant','text':'Try Halo Studio','ids':['halo'],'recommendedId':'halo'}]
        context=context_from(history,self.catalogue,None)
        self.assertIsNone(context['lastRecommendedId'])
        self.assertEqual(context['lastDisplayedIds'],[])

    def test_pause_is_acknowledged_without_recommending_again(self):
        reply,_=self.run_adviser('leave it for now',[json.dumps(self.plan(intent='acknowledge',execute=False))])
        self.assertEqual(reply['ids'],[])
        self.assertNotIn('action',reply)
        self.assertIn("haven't changed",reply['text'])
    def test_empty_selection_cannot_recommend_an_excluded_product(self):
        self.assertFalse(response_is_grounded('Try Halo Studio.',[],self.catalogue,1000))
    def test_independent_authorization_blocks_false_action(self):
        plan=self.plan(intent='add',execute=True)
        reply,_=self.run_adviser("don't add it",[json.dumps(plan),'{"execute":false}','Would you like help choosing a different product?'])
        self.assertNotIn('action',reply)
    def test_explicit_action_requires_both_model_checks(self):
        reply,generate=self.run_adviser('could you pop the one you recommended in my bag please',[json.dumps(self.plan(intent='add',execute=True)),'{"execute":true}'])
        self.assertEqual(reply['action']['productId'],'halo')
        self.assertEqual(reply['action']['type'],'add')
        self.assertEqual(generate.call_count,2)
    def test_buy_reuses_existing_bag_and_opens_review(self):
        reply,_=self.run_adviser('get me that one',[json.dumps(self.plan(intent='checkout',execute=True)),'{"execute":true}'],cart=[{'productId':'halo','quantity':1}])
        self.assertFalse(reply['action']['addProduct'])
        self.assertEqual(reply['action']['type'],'checkout')
    def test_ambiguous_reference_asks_question(self):
        question='Which of those two products do you mean?'
        reply,_=self.run_adviser('get that one',[json.dumps(self.plan(intent='clarify',ids=[],recommendedId=None,question=question)),question])
        self.assertEqual(reply['text'],question)
        self.assertNotIn('action',reply)
    def test_history_preserves_preferences_and_display_order(self):
        state={'preferences':{'budget':9000,'anc':False,'useCase':'daily gym'},'focusedProductId':'air-sport'}
        history=[{'role':'assistant','text':'Try Air Sport','ids':['air-sport','pulse'],'recommendedId':'air-sport','advisorState':state}]
        context=context_from(history,self.catalogue,None)
        self.assertEqual(context['previousState']['preferences']['budget'],9000)
        self.assertEqual(context['lastDisplayedIds'],['air-sport','pulse'])
        self.assertEqual(context['lastRecommendedId'],'air-sport')
    def test_missing_specification_can_remain_unknown(self):
        text="Mac compatibility isn't documented in this mock catalogue, so I can't confirm it. What connection does your Mac need?"
        reply,_=self.run_adviser('does it work with my mac',[json.dumps(self.plan()),text])
        self.assertEqual(reply['text'],text)
        self.assertNotIn('action',reply)
    def test_invalid_spec_reply_explicitly_admits_uncertainty(self):
        plan=self.plan(question='Which connection do you need?')
        reply,_=self.run_adviser('does it work with my Mac',[json.dumps(plan),'Halo Studio supports Bluetooth.','It is compatible with Mac devices.'])
        self.assertEqual(reply['source'],'clarification-fallback')
        self.assertIn("can't confirm",reply['text'])
        self.assertNotIn('action',reply)
    def test_invalid_plan_retries_then_clarifies(self):
        reply,generate=self.run_adviser('confusing input',['not json','still not json'])
        self.assertEqual(reply['source'],'clarification-fallback')
        self.assertNotIn('action',reply)
        self.assertEqual(generate.call_count,2)
    def test_unsupported_specs_and_product_names_rejected(self):
        selected=[p for p in self.catalogue if p['id']=='halo']
        self.assertFalse(response_is_grounded('Bluetooth 5.3 is supported.',selected,self.catalogue))
        self.assertFalse(response_is_grounded('Buy Form Pro.',selected,self.catalogue))
        self.assertFalse(response_is_grounded('Your order is confirmed.',selected,self.catalogue))
    def test_missing_compatibility_cannot_be_filled_with_general_knowledge(self):
        selected=[p for p in self.catalogue if p['id']=='halo']
        self.assertFalse(response_is_grounded('Halo Studio is compatible with Mac devices.',selected,self.catalogue))
        self.assertFalse(response_is_grounded('It connects via Bluetooth.',selected,self.catalogue))
        self.assertFalse(response_is_grounded('Halo Studio supports Bluetooth.',selected,self.catalogue))
        self.assertFalse(response_is_grounded('While it supports Bluetooth connectivity, Mac pairing is unknown.',selected,self.catalogue))
        self.assertTrue(response_is_grounded("I can't confirm whether it is compatible with your Mac; that is not documented.",selected,self.catalogue))
    def test_format_tradeoff_is_not_a_wrong_category_claim(self):
        selected=[p for p in self.catalogue if p['id']=='halo']
        self.assertTrue(response_is_grounded('Halo Studio headphones are less pocketable than earbuds.',selected,self.catalogue))
        selected=[p for p in self.catalogue if p['id']=='air-sport']
        self.assertFalse(response_is_grounded('Air Sport headphones offer a secure fit.',selected,self.catalogue))
    def test_unknown_specification_is_not_claimed_absent(self):
        selected=[p for p in self.catalogue if p['id']=='halo']
        self.assertFalse(response_is_grounded("It’s not splash-resistant.",selected,self.catalogue))
        self.assertFalse(response_is_grounded("It's not waterproof.",selected,self.catalogue))
        self.assertTrue(response_is_grounded('Splash resistance is not documented.',selected,self.catalogue))
    def test_customer_budget_is_allowed_without_inventing_specs(self):
        selected=[p for p in self.catalogue if p['id']=='halo']
        self.assertTrue(response_is_grounded('Halo Studio costs 18900 rupees and fits your 20000 budget.',selected,self.catalogue,20000))
    def test_personal_suitability_can_ask_before_recommending(self):
        text='What will you mainly use them for, and what is your budget?'
        reply,_=self.run_adviser('are these good for me',[json.dumps(self.plan(intent='clarify',ids=[],question=text)),text])
        self.assertEqual(reply['text'],text)
        self.assertNotIn('action',reply)

if __name__=='__main__':unittest.main()
